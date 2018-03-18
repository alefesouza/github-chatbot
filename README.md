# GitHub Chatbot

This is a chatbot to get GitHub informations using [botbuilder](https://github.com/Microsoft/BotBuilder) for Node.js written in TypeScript, it uses [LUIS](https://luis.ai) to interprete messages and get intents and entities.

It can get repository and user informations and the trending repositories list by language and time.

I developed it to be my final project on the [Microsoft's Maratona Bots](https://ticapacitacion.com/curso/botspt/) (Bots Marathon), an online course about chatbots development.

You can check it live [in English here](https://alefesouza.github.io/github-chatbot) or [in Portuguese here](https://alefesouza.github.io/github-chatbot/pt.html), you also can add it on Telegram, [in English here](https://t.me/ghchatbot) or [in Portuguese here](https://t.me/ghptchatbot).

## Steps to run it

Import the LUISProject.json file on your [luis.ai](https://luis.ai) website, then click on the Publish tab, copy the Endpoint url at the end of the page and paste on the LUIS_MODEL_URL key of the Bot/.env file, then just run:

    cd Bot
    npm install
    npm start

It will start the localhost bot service, so you can use it on the [botframework-emulator](https://github.com/Microsoft/BotFramework-Emulator/releases/latest).
