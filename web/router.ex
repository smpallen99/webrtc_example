defmodule WebrtcExample.Router do
  use WebrtcExample.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", WebrtcExample do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/:name", PageController, :show
  end

  # Other scopes may use custom stacks.
  # scope "/api", Webrtc do
  #   pipe_through :api
  # end
end
