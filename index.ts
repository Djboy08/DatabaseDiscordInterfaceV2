// Require the necessary discord.js classes
import {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  MessageFlags,
  WebhookClient,
  EmbedBuilder,
} from "discord.js";
import type { Client as ClientType } from "discord.js";

const fs = require("node:fs");
const path = require("node:path");
const { MongoClient } = require("mongodb");
const { unbanLengthCheckDatabase, getBans } = require("./database-helper");

// Extend Client with commands property
declare module "discord.js" {
  interface Client {
    commands: Collection<string, any>;
    cooldowns: Collection<string, any>;
    modals: Collection<string, any>;
    db: any;
  }
}

const mongoClient = new MongoClient(Bun.env.DATABASEURL);
await mongoClient.connect();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.modals = new Collection();
client.db = await mongoClient.db(Bun.env.DATABASE_NAME);
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: any) => file.endsWith(".js") || file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file: any) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const modalsPath = path.join(__dirname, "modals");
const modalFiles = fs
  .readdirSync(modalsPath)
  .filter((file: any) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of modalFiles) {
  const filePath = path.join(modalsPath, file);
  const modal = require(filePath);
  if ("execute" in modal) {
    client.modals.set(
      modal.name,
      async (interaction: any, initalInteraction: any) => {
        if (!interaction.member.roles.cache.has(modal.roleNeeded)) {
          await interaction.reply({
            content: "You do not have permission to use this command.",
            flags: 1 << 6, // Ephemeral
          });
          return;
        }
        console.log("Executing modal:", modal.name);
        await modal.execute(interaction, initalInteraction);
      },
    );
  }
}

// Log in to Discord with your client's token
setInterval(() => {
  unbanLengthCheckDatabase(client.db);
}, 1000 * 60);

let BANS: any = null;
setInterval(async () => {
  BANS = await getBans(client.db);
}, 1000 * 8);

const GUID = Bun.env.RBLX_GUID!;
const server = Bun.serve({
  port: 3000,
  // `routes` requires Bun v1.2.3+
  routes: {
    // Static routes
    "/exploit/webhook/": {
      POST: async (req: Request) => {
        try {
          let headers = req.headers;
          if (
            !headers.get("authorization") ||
            headers.get("authorization") != GUID
          ) {
            console.log("NO AUTHORIZATION");
            return Response.json({
              success: false,
              error: "Incorrect Authorization",
            });
          }

          const hook = new WebhookClient({
            url: Bun.env.DISCORD_EXPLOIT_LOG_WEBHOOK_URL!,
          });
          const body = await req.json();
          const msg = body.msg;
          // let randomadmin = await this.discord.getRandomAdmin();
          // randomadmin = randomadmin || "No Admin Is Online";
          // if(msg.search("Dealing damage faster than a usual rate.") >= 0) return;
          const embed = new EmbedBuilder()
            .setTitle("Exploit Logged")
            .setFooter({ text: "from game" })
            .setDescription(msg);
          // hook.send({content: `<@${randomadmin.user.id}>`, embeds: [embed]});
          await hook.send({
            content: `Temp removed admin ping`,
            embeds: [embed],
          });
          return Response.json({ success: true });
        } catch (er) {
          return Response.json({ success: false, error: er });
        }
      },
    },
    "/trade/webhook/": {
      POST: async (req: Request) => {
        try {
          let headers = req.headers;
          if (
            !headers.get("authorization") ||
            headers.get("authorization") != GUID
          ) {
            console.log("NO AUTHORIZATION");
            return Response.json({
              success: false,
              error: "Incorrect Authorization",
            });
          }
          const hook = new WebhookClient({
            url: Bun.env.DISCORD_TRADE_LOG_WEBHOOK_URL!,
          });
          const body = await req.json();
          const msg = body.msg;
          let regex = /Account Age - ([\s\S]*?) Days/g;
          let find = msg.match(regex);
          let isAgeBelow100 = false;
          if (find) {
            find.forEach((element: any) => {
              let n = element
                .replace("Account Age - ", "")
                .replace(" Days", "")
                .replace(",", "");
              n = parseFloat(n);
              if (isAgeBelow100 == false && n <= 100) {
                isAgeBelow100 = true;
              }
            });
          }
          // if(msg.search("Dealing damage faster than a usual rate.") >= 0) return;
          const embed = new EmbedBuilder()
            .setTitle("Trade Log")
            .setFooter({ text: "from game" })
            .setDescription(msg);

          if (isAgeBelow100) {
            embed.setColor("#FFCCCB");
          }
          await hook.send({ embeds: [embed] });
          return Response.json({ success: true });
        } catch (er) {
          return Response.json({ success: false, error: er });
        }
      },
    },
  },

  // (optional) fallback for unmatched routes:
  // Required if Bun's version < 1.2.3
  fetch(req) {
    const host = req.headers.get("host");
    // e.g. "api.example.com:3000"

    const hostname = host?.split(":")[0]; // remove port
    const subdomain = hostname?.split(".")[0];

    if (subdomain === "api" && req.url.endsWith("/bansv4")) {
      if (BANS) {
        return Response.json(BANS);
      } else {
        return Response.json({ success: false });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at ${server.url}`);

client.login(Bun.env.DISCORD_TOKEN);
client.on(Events.ShardError, (error) => {
  console.error("A websocket connection encountered an error:", error);
});
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient: ClientType<true>) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
