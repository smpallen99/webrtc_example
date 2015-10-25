# Webrtc Example

This is a webrtc peer to peer audio only example. The server is written
in Elixir with the Phoenix Framework, using Phoenix channels for 
signaling. 

# Usage

* Download and compile the project

* Get and compile the dependencies

```
mix do deps.get, deps.compile
```

* Start the server

```
iex -S mix phoenix.server
```

* Using two PCs, visit the web page on each
* Login with two different names (eg. steve and joe)
* On the PC logged in as steve, enter joe in the input box and click call
* You should now have a call between the two browsers

## Issues

* There is an issue with the phoenix auto load and the login. Before
  restarting the server, make sure that the browsers are not logged in. 
  If they are, you will get a login failure. If this happens, reload
  the web pages to the default url and restart the browser

* The channels has a lot of debugging logging that helps in understanding
  the signaling message flow. You can disable this by setting the log level
  to something other than debug

* The project is setup for mysql, but you don't have to worry about that.
  Just don't run the ecto commands to create the database.

## License

`webrtc_example` is Copyright (c) 2015 E-MetroTel

The source code is released under the MIT License.

Check [LICENSE](LICENSE) for more information.
