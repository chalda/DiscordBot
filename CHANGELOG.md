[0.4.0]
- Improved embeds for urban dictionary, wolfram alpha and wikipedia commands
- eval is no longer "restricted" and can now be safely used to execute arbitrary javascript in a sandboxed VM. You have access to lodash family of methods under _ variable in the context.
- exec has been added. This command is similar to the previous "eval". The input MUST be actual javascript code. This command is restricted by default. It has access to lodash (as _), discord.js api, and request-promise library but not the filesystem or other builtins or libraries. To enable this, follow the examples in the permissions.json.example and create your own permissions.json enabling this command as it an give malicious actors ways to use your bot for evil.

[0.3.0]
- Improved default behavior of `queue` for long play queues
- Added `stop_playback` command
- Made `playlist` command support YouTube playlists