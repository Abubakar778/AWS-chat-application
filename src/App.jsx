import React, { useCallback, useRef, useState, useEffect } from "react";

function App() {
  const URL =
    "wss://yw4e54orlb.execute-api.us-east-1.amazonaws.com/production/";
  const [isConnected, setisConnected] = useState(false);
  const [Members, setMembers] = useState([]);
  const [messages, setmessages] = useState([]);

  const Socket = useRef(null);

  useEffect(() => {
    return () => {
      Socket.current?.close();

      setMembers([]);
    };
  }, []);

  const onSocketOpen = useCallback(() => {
    setisConnected(true);
    const name = prompt("Enter your Name");
    Socket.current.send(
      JSON.stringify({
        action: "setName",
        name,
      })
    );
  }, []);

  const onSocketClose = useCallback(() => {
    setisConnected(false);
  }, []);

  const onSocketMessage = useCallback((dataStr) => {
    // console.log(dataStr);
    const data = JSON.parse(dataStr);
    // console.log(data);
    if (data.member) {
      setMembers(data.member);
    } else if (data.messagePrivate) {
      alert(data.messagePrivate);
    } else if (data.messagePublic) {
      setmessages((prevMessages) => [...prevMessages, data.messagePublic]);
      // setmessages(messagesArray);
    } else if (data.systemMessage) {
      console.log("this is system message", data);
    }
  });

  const onSendPrivateMessage = useCallback((to) => {
    const message = prompt("Enter private message for " + to);
    console.log({ to, message });
    Socket.current.send(
      JSON.stringify({
        action: "sendPrivate",
        to,
        message,
      })
    );
  }, []);

  const onSendPublicMessage = useCallback(() => {
    const message = prompt("Enter public Message");
    // console.log(message);
    Socket.current.send(
      JSON.stringify({
        action: "sendPublic",
        message,
      })
    );
  }, []);

  const onSocketDisconnect = useCallback(() => {
    Socket.current.close();
    console.log("disconnected");
  }, [isConnected]);

  const onConnect = useCallback(() => {
    if (Socket.current !== WebSocket.OPEN) {
      Socket.current = new WebSocket(URL);
      Socket.current.addEventListener("open", onSocketOpen);
      Socket.current.addEventListener("close", onSocketClose);
      Socket.current.addEventListener("message", (event) => {
        console.log(event.data);
        onSocketMessage(event.data);
      });
    }

    console.log("connected");
  });

  return (
    <>
      <div className="w-full h-screen bg-slate-300 flex flex-col items-center">
        <div className="my-5 font-serif text-xl font-bold text-white">
          Chat Application
        </div>
        <div className=" w-3/4 h-3/4 bg-white shadow-sm shadow-slate-700 flex flex-row">
          <div className="w-1/3 h-full bg-red-300">
            <p className="text-gray-700 font-bold text-center mt-5 ">
              Chat Members
            </p>
            <ul className="ms-5 font-serif font-bold text-white hover:cursor-pointer">
              {Members.map((item, index) => {
                return (
                  <>
                    <li className="hover:cursor-pointer hover:text-blue-700 hover:text-green-700">
                      <p
                        className="md:tracking-wider"
                        key={index}
                        onClick={() => onSendPrivateMessage(item)}
                      >
                        {item}
                      </p>
                    </li>
                  </>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col bg-lime-300 w-full ">
            {
              // console.log(messages)
              messages &&
                messages.map((item, index) => {
                  return (
                    <>
                      <p
                        className="font-serif bg-white my-2 w-fit ms-2 p-1 rounded-sm"
                        key={index}
                      >
                        {item}
                      </p>
                    </>
                  );
                })
            }

            <div className="flex flex-row space-x-2 ms-2 mt-auto mb-2">
              {isConnected ? (
                <>
                  <button
                    className="p-2 bg-green-700 text-white font-semibold hover:bg-green-500 rounded-sm"
                    onClick={onSendPublicMessage}
                  >
                    Send Public Message
                  </button>
                  <button
                    className="p-2 bg-red-700 text-white font-semibold hover:bg-red-500 rounded-sm"
                    onClick={onSocketDisconnect}
                  >
                    Leave
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="py-0.1 px-3 bg-green-700 text-white font-semibold hover:bg-green-500 rounded-sm"
                    onClick={onConnect}
                  >
                    Join
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
