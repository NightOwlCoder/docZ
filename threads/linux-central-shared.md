Got this slack message from a team mate:

> Hi team, Amazon Photo team are trying to upgrade to V2 client, they will call the new client's API (WeblabAndroidClient). They are following this [instruction](https://quip-amazon.com/aV0IAOr1qUNV/WeblabAndroidClient-10-onboarding), in brazil, the upgrade works. However in Peru, since they also use a lockfile so Option 1 not works, and option2 also encounter this issue Compute failed: The following explicitly requested packages do not exist in the version set 'Linux/central': WeblabAndroidClient . Do we have other way for peru?


Our pipeline deploys to `amazon/shared`, see https://pipelines.amazon.com/pipelines/WeblabAndroidClient?state=%2Fpipelines%2FWeblabAndroidClient.

From the build log, https://build.amazon.com/transform_log?transformId=8372b6d5-9366-4baa-9cad-c776362e1e13#L3221  i can see it published: `packageNamespace=com.amazon.weblab, packageName=WeblabAndroidClient, packageVersion=1.0} has a status of 'Published' in destination repository`

Do the ask is:

is `Linux/central` the same as `amazon/shared` and if not, are our instructions wrong?

Can you read ai/thread-analyzer/linux-central-shared.md and help me answer? Use your tools! Investigate!