const { Socket } = require("phoenix-channels");
const axios = require("axios");

const mySocket = new Socket("ws://localhost:4000/socket");
mySocket.connect();

class Convo {
  constructor() {
    this.channels = [];
    this.newUser();
  }

  createChannel = topic => {
    const channel = mySocket.channel(`beam:${topic}`, { name: `${topic}` });
    this.joinChannel(channel);
    this.listenOnChannel(channel);
    this.channels.push(channel);
  };

  listChannels = () => {
    this.channels.forEach((channel, i) =>
      console.log(i + 1, "for channel name:", channel.params.name)
    );
  };

  selectedChannel = () => this.channel.params.name;

  selectChannel = channel_id => {
    this.channel = this.channels[channel_id - 1];
    return this.channel;
  };

  joinChannel = channel => {
    channel
      .join()
      .receive("ok", resp => {
        console.log("Joined successfully channel: ", channel.params.name);
      })
      .receive("error", resp => {
        console.log("Unable to join", resp);
      });
  };

  listenOnChannel = channel => {
    channel.on("shout", msg => {
      if (msg.from !== this.user) {
        console.log("\nGot message from", msg.from, "->", msg.body);
      }
    });
  };

  sendMessage = msg => {
    this.channel.push("shout", { from: this.user, body: msg });
    console.log("Message sent");
  };

  newUser = () => {
    const params = { user: { setup: true } };
    return axios
      .post("http://localhost:4000/api/users", params, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        this.user_id = response.data.data.user_id;
        this.user = `User${this.user_id}`;
        console.log(this.user);
      })
      .catch(error => {
        console.log(error.response);
      });
  };

  startConvo = () => {
    this.createChannel("lobby");
    this.createChannel(this.user_id);
    this.listChannels();
    this.selectChannel(1);
    console.log("Selected Channel: #1");
  };
}
