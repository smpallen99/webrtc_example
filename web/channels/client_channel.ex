defmodule Webrtc.ClientChannel do
  use Phoenix.Channel
  require Logger
  alias Webrtc.State

  def join("webrtc:client-" <> name, params, socket) do
    Logger.debug "join: name: #{name}, params: #{inspect params}"
    case State.get(name) do
      nil ->
        State.put name, %{}
        {:ok, socket}
      data -> 
        Logger.error "join error: data: #{inspect data}"
        {:error, socket}
    end
  end

  ##########
  # Outgoing message handlers

  def handle_out(event, msg, socket) do
    Logger.warn "handle_out topic: #{event}, msg: #{inspect msg}"
    {:reply, {:ok, msg}, socket}
  end

  ##########
  # Incoming message handlers

  def handle_in("client:webrtc-" <> nm, %{"type" => "offer", "name" => name} = msg, socket) do
    Logger.debug "Sending offer to #{name}"
    case State.get nm do
      nil -> :ok
      data -> 
        State.put nm, Map.put(data, "otherName", name)
        do_broadcast name, "offer", %{type: "offer", offer: msg["offer"], name: nm}
    end
    {:noreply, socket}
  end
  def handle_in("client:webrtc-" <> nm, %{"type" => "answer", "name" => name} = msg, socket) do
    Logger.debug "Sending answer to #{name}"
    case State.get nm do
      nil -> :ok
      data -> 
        State.put nm, Map.put(data, "otherName", name)
        do_broadcast name, "answer", %{type: "answer", answer: msg["answer"]}
    end
    {:noreply, socket}
  end
  def handle_in("client:webrtc-" <> nm, %{"type" => "leave", "name" => name} = msg, socket) do
    Logger.debug "Disconnecting from  #{name}"
    case State.get nm do
      nil -> :ok
      data -> 
        State.put nm, Map.put(data, "otherName", nil)
        do_broadcast name, "leave", %{type: "leave"}
    end
    {:noreply, socket}
  end
  def handle_in("client:webrtc-" <> nm, %{"type" => "candidate", "name" => name} = msg, socket) do
    Logger.debug "Sending candiate to " <> name
    do_broadcast name, "candidate", %{candidate: msg["candidate"]}
    {:noreply, socket}
  end
  def handle_in("client:webrtc-" <> nm, msg, socket) do
    type = msg["type"]
    Logger.debug "name: #{nm}, unknown type: #{type}, msg: #{inspect msg}"
    do_broadcast nm, "error", %{type: "error", message: "Unrecognized command: " <> type}
    {:noreply, socket}
  end
  def handle_in(topic, data, socket) do
    Logger.error "Unknown -- topic: #{topic}, data: #{inspect data}"
    {:noreply, socket}
  end

  defp do_broadcast(name, message, data) do
    Webrtc.Endpoint.broadcast "webrtc:client-" <> name, "webrtc:" <> message, data
  end
end
