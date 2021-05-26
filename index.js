// Setup .env
require("dotenv").config();

// Import modules
const Discord = require("discord.js");
const client = new Discord.Client();
const express = require("express")
const fs = require('fs');

// Setup express
const app = express()
const PORT = 3000

app.use(express.json());
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));

// Route payload
app.post("/payload", (req, res) => {
  let listChannelID = fs.readFileSync("./data/hook_channels.txt", "utf-8").split("\n").filter((item) => item != "");
  for (let channelID of listChannelID) {
    let channel = client.channels.cache.find((item) => item.id == channelID);

    let message = new Discord.MessageEmbed()
      .setAuthor(
        "Github",
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        "https://github.com/Morbotu/drone-PWS"
      )
      .setColor(0xff0000);
    if (req.header("X-GitHub-Event") == "check_run") {
      message
        .setTitle("Check_run")
        .setDescription(
          `Action: ${req.body.action}\n` +
          `Status: ${req.body.check_run.status}\n` +
          `Conclusion: ${req.body.check_run.conclusion}\n` +
          `Link: ${req.body.check_run.html_url}`
        )

    }

    if (req.header("X-GitHub-Event") == "push") {
      let description = "";

      for (let commit of req.body.commits) {
        description +=
          `Committer: ${commit.committer.name}\n` +
          `Message: ${commit.message}\n` +
          "Link: https://github.com/Morbotu/drone-PWS/commit/e3521f114440da9f8695895a23834e2c8e8338c0\n" +
          "----------------------------\n"
      }
      message
        .setTitle("Push")
        .setDescription(description)
    }

    channel.send(message)
      .catch(console.error);
  }
  res.send("200");
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.content === "R!add hook") {
    let hooks = fs.readFileSync("./data/hook_channels.txt", "utf-8").split("\n").filter((item) => item != "");
    if (!hooks.includes(msg.channel.id))
      hooks.push(msg.channel.id);
    fs.writeFile("./data/hook_channels.txt", hooks.join("\n"), (err) => { if (err) console.log(err) });
    msg.reply("hook added")
      .catch(console.error);
  }
  if (msg.content == "R!remove hook") {
    let hooks = fs.readFileSync("./data/hook_channels.txt", "utf-8").split("\n").filter((item) => item != "" && item != msg.channel.id);
    fs.writeFile("./data/hook_channels.txt", hooks.join("\n"), (err) => { if (err) console.log(err) });
    msg.reply("hook removed")
      .catch(console.error);
  }
});

client.login(process.env.BOT_TOKEN);