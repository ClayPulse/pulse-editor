# Mobile User Guide
### Installation

An Android APK is available in our GitHub release page.

(Currently we only support Android, although it is technically possible to have an iOS build — check out our developer guide on GitHub for building iOS client)

You must then configure settings in the app. Specifically, to use Voice Chat, you need to have all STT, LLM, TTS configured; to only use Agentic Chat Terminal or Code Completion, you need to configure LLM. 

| Modality | Supported Provider |
| --- | --- |
| STT | OpenAI |
| LLM | OpenAI |
| TTS | OpenAI, ElevenLabs |

(For TTS, you need to enter a voice name or voice ID which you can find from your provider. e.g. “alloy” for OpenAI TTS1, “Maltida” for ElevenLabs.)

### Open File

Click the menu at top-left corner, then click either “new file” to get an empty file or “open file” to select one from your file system.

### Voice Chat

(Make sure you have configured all STT, LLM, TTS providers and API keys)

Click the microphone icon in the bottom toolbar, and grant permission if prompted. Then start chatting using voice. Any code changes will be made in the code view once the request completes.

### Drawing Gesture

Click the pen icon in the bottom toolbar, and start drawing using your finger. If you wish to restart, simply toggle off and on the pen tool again.

### Agentic Chat Terminal

(Make sure you have configured LLM provider and API key)

Click the “Open Chat View” icon in the bottom toolbar. Then select your desire agent, or define your own by clicking the plus icon. Next, start chatting by typing in text in the input box.

### Code Completion

(Make sure you have configured LLM provider and API key)

Type anything in an open file, then a suggestion would become available in grey text. Swipe right to accept changes, or keep typing to refresh new suggest.