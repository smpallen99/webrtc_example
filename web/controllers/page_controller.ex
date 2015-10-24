defmodule WebrtcExample.PageController do
  use WebrtcExample.Web, :controller
  require Logger

  def index(conn, _params) do
    render conn, "index.html", name: ""
  end

  def show(conn, params) do
    Logger.debug "show with params: #{inspect params}"
    render conn, "index.html", name: params["name"]
  end
end
