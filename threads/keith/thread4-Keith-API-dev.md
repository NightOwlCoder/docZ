**sibagy** (2025-05-28 14:03:51 PDT):
hey there! long time we do not talk!

**sibagy** (2025-05-28 14:06:17 PDT):
I'll be responsible on design an MCP for the weblab domain....
and I'm starting to collect data on how it should work

do you have any thoughts about:
1. Auth
2. APIs I could access? we will start slow, like:
• is this thing o? :joy: 
• percentage of dial up exposure?
• percentage for each treament?
• who does this belongs to ?
• etc
later, we will embark on harder things like decisions and other stuff

**keitnorm** (2025-05-28 14:09:02 PDT):
sweet dude! yeah i assume you saw that MCP thing that caused a big kerfuffle for us?

They were mostly doing everything right, just not using their own API key and using the API front door, but I think auth and stuff was fine. They were just using midway, which you can use to call the 'public' API. You just need to create an API user which will get its own key and have its own permissions and rate limit settings. But, as an internal user I think it will be much easier for you to get access than someone outside

**keitnorm** (2025-05-28 14:13:11 PDT):
here's the existing APIs, I'd assume you can access the internal ones too, but if you want to be more conservative could just stick to the ones above the 'internal' line <https://code.amazon.com/packages/WeblabAPIModel/blobs/mainline/--/model/main.xml>

**sibagy** (2025-05-28 14:16:01 PDT):
As an MCP that will be loaded by some tool into someone else's browser/Q CLI/Cline/etc, this API key business can be a step back...
Is there a way for us to throttle based on just user?
In the end, that is what it is, someone typing something against an LLM, not some crazy API Python app thingy....
I can also implement some throttle on the MCP code itself, to avoid idiotic question like give me all amazon running weblabs :smile:

**keitnorm** (2025-05-28 14:18:50 PDT):
yeah i see what you mean, i don't think the api gateway current supports that, but maybe dig into how it's setup in aws to see, it's all in this account <https://iad.merlon.amazon.dev/account/aws/400858406294/sdo#attributes> think the rate limit stuff is under api gateway -&gt; usage plans

**sibagy** (2025-05-28 14:23:43 PDT):
in the end, MCP's can have configuration, so we could indeed ask for the person to create an API key, like `MEMORY_FILE_PATH` below.
if they do not enter one, we could setup a "community shared one" that allows only 1 query/minute?
```
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {
        "MEMORY_FILE_PATH": "/Users/sibagy/fileZ/ai/memory-bank/memory.json"
      },
      "alwaysAllow": [
        "create_entities",
        "read_graph",
        "add_observations",
        "delete_entities",
        "create_relations"
      ]
    }
```

**sibagy** (2025-05-28 14:24:23 PDT):
that is how Cline/Ziya do their things, bring your own account or use our immensily throttled one :smile:

**keitnorm** (2025-05-28 14:24:40 PDT):
yeah totally, that makes sense

**sibagy** (2025-05-28 14:26:39 PDT):
is the onboarding to get a new API key too hard? can you point me how to do it?

**keitnorm** (2025-05-28 14:30:55 PDT):
you just add an entry to this file <https://code.amazon.com/packages/WeblabAPI/blobs/647560e303bda4728780ae7e92367a2e183d174a/--/src/api-consumers.ts#L463>, there are midway consumers and aws auth consumers, that harmony one is an example of a midway one

**sibagy** (2025-05-28 18:01:53 PDT):
how that works? the MCP will be immediately available to over 4,000 people (today's estimate)
will each of them "ask us" to be added to this file? what steps will they need to take?

**sibagy** (2025-05-30 15:09:02 PDT):
Hey Keith, another question related to the API:
&gt; Where/How we hit it?

> *sibagy (2025-05-30 15:10:08 PDT):*
> For instance, this is how one of the MCP Servers check oncall rotation for instance:

> ```
> 	   const apiUrl = new URL(`<https://oncall-api.corp.amazon.com/teams/${teamName}/rotations/${rotation.rotationId}/overrides>`);
> 	   try {
> 	     const client = MidwayHttpClient.getInstance();
> 	     const response = await client.request(apiUrl, [HttpMethod.POST](http://HttpMethod.POST), {
> 	       headers: { "Content-Type": "application/json" },
> 	       body: JSON.stringify({ targets, members, rotationId: rotation.rotationId, overrideGap, start, end })
> 	     });

> 	     if (response.statusCode !== 201) {
> 	       return {
> 	         content: [{ type: "text", text: JSON.stringify({ error: `Override creation failed with ${response.statusCode}` }, null, 2) }],
> 	         isError: true
> 	       };
> 	     }

> 	     return {
> 	       content: [{
> 	         type: "text",
> 	         text: JSON.stringify({
> 	           success: true,
> 	           message: `Override created for team ${teamName} with rotation ${rotation.rotationName}`,
> 	           override: response.body
> 	         }, null, 2)
> 	       }]
> 	     };
> 	   } catch (error: any) {
> 	     return {
> 	       content: [{ type: "text", text: JSON.stringify({ error: `Network error: ${error.message}` }, null, 2) }],
> 	       isError: true
> 	     };
> 	   }
> ```

**keitnorm** (2025-05-30 15:10:04 PDT):
<https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI/#HCallingtheWeblabAPI>
