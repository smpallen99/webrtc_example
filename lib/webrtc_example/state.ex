defmodule WebrtcExample.State do
  require Logger

  def start_link do
    Agent.start_link(fn -> HashDict.new end, name: __MODULE__)
  end

  def get do
    Agent.get __MODULE__, fn(state) -> state end
  end
  
  def get(name) do
    Agent.get __MODULE__, fn(state) -> Dict.get state, name end
  end

  def put(name, data) do
    Agent.cast __MODULE__, fn(state) -> Dict.put state, name, data end
  end

  def put(name, field, value) do
    Agent.cast __MODULE__, fn(state) -> 
      data = Dict.get(state, name)
      Dict.put state, name, Map.put(data, field, value)
    end
  end

  def clear do
    Agent.cast __MODULE__, fn(_) -> HashDict.new end
  end

  def delete(name) do
    Agent.cast __MODULE__, fn(state) -> Dict.delete state, name end
  end
  
end
