# Original request from Guhao

Guhao Fan
  Aug 11th at 16:22
Hi Peru team, please help on the following shared repo problem and thanks beforehand ...
we have following publish to shared repo setup: select.ion, app.ts, we are trying to publish the two package to shared repo in our pipeline.
but we just notice since in brazil.ion, it only gives the overall version 2.0, and publish shared repo only recognize this 2.0, it cannot publish due to 2.0 version is already published. (but for MobileWeblabAndroidClient, the actual build version is 2.0.2891.0).
that cause we only publish our package at first time we try publishing, and all subsequence updates are failed to publish, the pipeline always show success even if nothing is published to shared repo.
can anyone help with the correct setup? we still need to set brazil.ion to have the 2.0 as version, while we want CA publish to use the minor build version (edited) 
9 replies


Matt Goertzen
  Aug 11th at 16:27
The version being published is the one from your gradle build, which I think is specified here: https://code.amazon.com/packages/MobileWeblabAndroidClient/blobs/91810b7feb60b64d924f47fbcd14c8cb3d91a82e/--/build-peru.gradle#L73
This could be a use case for automated versioning, and there's a gradle plugin that makes using it quite simple.


Guhao Fan
  Aug 11th at 16:44
thanks for the info, one more followup question, when define a sequence, idon't know yet what will be the best strategy and value, if i leave it as default, can i change it later? (edited) 
16:45
ahhh and, i saw the package is for gradle, is there another one for peruSPM as well? (edited) 


Matt Goertzen
  Aug 11th at 16:46
You can change it later, with the brazil versionset sequences update command.  There's no default strategy, you'll have to pick one of vsr (update whenever there's any change to any package in the versionset), commit (update whenever any of the packages consuming the sequence get a new commit), or delegate (undefined by the versionset, but package consumption in brazil.ion must define a strategy)
16:48
I don't know if there's a tool for peruSPM, and I'm not super familiar with how SPM works...is there a build script where you define the version to be published?  As long as your build script can execute commands to obtain that value, you can run brazil-context package build-id --sequence <sequenceName> to get the value.


Guhao Fan
  Aug 11th at 16:51
ahh we do have a script for SPM, i will try if that works by getting the value from command.
sorry one more question pop up and thanks for all the help..
other team only looking for our 2.0 version, (for example), if i change my gradle to have 2.0.12345, will that 2.0 version lookup fail?


Matt Goertzen
  Aug 11th at 16:54
The 2.0 lookup won't fail, it just won't have your updated version.
16:54
They will need to update that to get the latest


Guhao Fan
  Aug 11th at 16:55
:dizzy_face: oh ok ...




# second request from Guhao



Guhao Fan
  Tuesday at 11:21
Hi Peru team, thanks Matt's help on my previous thread.
i tried use peru auto versioning to construct version to publish to CA shared repo, but I realized it is not fit in our case.
My package builds in my team's VS, but after that it will publish to customer's VS and build in their VS. auto versioning requires a sequence tie to my building VS, this makes the package can only build in my VS (only my VS has the sequence) but not able to build in other VS.
Wondering if there is other alternative, such as:
can I overwrite the existing version in CA shared repo?
can I take git release tag to be the build version? (might need experience from other team that have similar problem)
(edited)
10 replies


Matt Goertzen
  Tuesday at 11:23
Maybe I misunderstood your original question.  I thought you were publishing to CodeArtifact, not to a customer's versionset


Guhao Fan
  Tuesday at 11:24
its both, we try to use same branch of code to publish to CA and publish to other VS


Matt Goertzen
  Tuesday at 11:24
Peru isn't set up well for both. You should pick one
:point_up_2:
1



Guhao Fan
  Tuesday at 11:25
we can easily cut a new branch only for publish to CA, but that will result in many manual work that our main code update we always need to rebase the other branch...
11:25
ahhh ok ... :cry:


Matt Goertzen
  Tuesday at 11:26
Really Peru is set up for CodeArtifact publishing; versionset publishing is just carried over from the old Brazil-ish model (edited) 
11:30
If you must do both, then you can't use automatic versioning; you can hard-code the version for publishing in your build scripts and just remember to update it when you want to publish a new version to CodeArtifact


Guhao Fan
  Tuesday at 11:31
got it thanks! yeah unfortunately I have to do both, those are request from our customers and both build style provides value


Eugene Cheung
  Tuesday at 12:13
yeah unfortunately I have to do both, those are request from our customers
Is your team and your customers familiar with how dependency vending/consumption works outside of Amazon (e.g. on Maven Central), or is this more based on the existing Brazil patterns?


Guhao Fan
  Tuesday at 12:15
mshop specifically want us to build package into their versionset, can't speak for them, but for me and my team, we are more based on old brazil patterns, we just recently start to look in to shared repo while we have vending our package in brazil pattern for past many years (edited) 


# doc he wrote
https://quip-amazon.com/lIuhAyjBU2KM/Peru-CA-shared-repo-setup

pasted below to help you, but the original quip has the links and images...

---
Peru CA shared repo setup

Background

We didn’t use the right way to publish to CA, making our library in CA repo stays at the version in April.

* Previous publish to CA not working

After further investigation, the native peru way to publish to CA doesn’t support our use case

* Peru native way not fit our use case

We need to vend our peru package to both CA and customer’s VS, This doc designs and develops our own way to vending to CA shared repo.

We already have customers that require our package in CA shared repo. this task has great value.

Our alternative solution

We just need to provide a guaranteed incremental number to be the version, propose to use build number as the version number

* https://amzn-custserv.slack.com/archives/C017K0BFYTH/p1755022629699319

One biggest benefit of using build number is that we can find what commit that the version is on by searching for the build number. 

* peru auto versioning starts from 1, 2, 3, ... and there is no way to tell the peru version points to which commit, it will produce huge overhead when trouble shooting. (there is no easy way to find out what exactly in CA shared repo - ref)

Implementation

Requirements

* Using version 2.0 for VS build, because existing customer like mshop already hard code to look for 2.0 of our library. 
    * Once we start to vend to both CA and VS, In the future if customers want to switch to use shared repo, they just need to switch to use 2.0.+ as the version number.
* We don’t want to create new branch, we want to use new-client branch vends to both CA and VS.
* We want to update our new-client branch build scripts, to give out version based on condition:
    * if we are building the package to customer’s VS, use version number 2.0.
    * if we are building the package to shared repo, use the build number (2.0.12345.0) as the version number.

Detail implementation

Proposing to let build script publish both 2.0 and 2.0.12345.0 into WIRE during build, and in later pipeline steps, when publish to CA shared repo, we pick 2.0.12345.0 to publish, when publish to customer VS, we pick 2.0 to publish (noop for this, when building VS, builder take artifact from WIRE, both 2.0 and 2.0.12345.0 available)

Other option that not get picked - Brazil channel suggested way but not take (due to extra operation complexity)

* comparing to my above solution, the brazil suggested requires additional pipeline setup, and a one time setup to add a “flagging” package to tell build which version to pick.

Build both versions to WIRE

Android

publications {
    mavenSharedRepo(MavenPublication) {
        groupId = "com.amazon.weblab"
        artifactId = "MobileWeblabAndroidClient"
        version = this.getBuildVersion() // get build version from brazilCLI
        from components.all
    }

    targetVersionSet(MavenPublication) {
        groupId = "com.amazon.weblab"
        artifactId = "MobileWeblabAndroidClient"
        version = '2.0'
        from components.all
    }

    releaseDeprecatedMshopAlias(MavenPublication) {
        groupId = "com.amazon.mshop"
        artifactId = "MobileWeblabAndroidClient"
        version = "1.3"
        from components.all
    }
}

we just need to add new items in publications block in gradle, the MavenPublication is already points to WIRE, the mavenSharedRepo/targetVersionSet is just alias to indicate what does this publish do, we can give any string. 

Success build proof: https://build.amazon.com/7486810168

IOS

By current investigation, we don’t need to keep 2.0.0 to build to VS, since SPM naturally use from 2.0.0 that already handles versions of 2.0.12345.0.

Will run test if that works (code repo search, dryrun build in mshop).

If we still need to provide both 2.0.0 and 2.0.12345.0, add another publish-spm-wire-package.sh 2.0.12345.0in build script.

Appendix

Previous publish to CA not working

on April 2025, we start to publish mobile weblab client to peru CA shared repo. but we didn’t do it correct. 

* CA shared repo requires we give incremental version number every time when our code has new commit. We were still using the old brazil style, give a fixed version 2.0 and every time when update we use the no-change 2.0 version number.

CA shared repo is not able to overwrite new content of package to a same version number. 

This cause our library version stays at April (only the first 2.0 package we upload is successfully goes into CA shared repo).

Peru native way not fit our use case

Peru requires peru auto versioning to provide the incremental version number for shared repo

* https://amzn-custserv.slack.com/archives/C023DRU175G/p1754954557562689

This solution DOES NOT fit our use case. 

* To enable auto versioning, we need to create a sequence that ties to a single VS, makes our package on only build in that VS and no longer able to build into mshop (and all other customer) VSs.

We need to both vending our package the CA and customer’s VS, so the peru solution doesn’t fit us.

Brazil channel suggested way but not take (due to extra operation complexity)

Proposing to have separate Version Set (pipeline) to build to CA shared repo, we will let our build script to find out whether we are building to VS or CA shared repo.

* We already have “clients-peru” VSs, will reuse those VS to use them as the VS to signal build to CA.
* in build script we check what destination it is building to, and derive versions accordingly
* re-purpose the clients-peru pipelines to publish to CA shared repo only with build version as package version.



How to let script figure out which destination we are building to

We will take the brazil channel suggestion, create a “flag” package and use the package to config the destination.

* ref: https://amzn-custserv.slack.com/archives/C017K0BFYTH/p1755552940972519

The package (for android) is created at MobileWeblabAndroidClientPeruBuildDestinationConfig with two different branch point to shared repo or version set (mainline default to version set)

We will publish the VersionSet flag branch to mshop mainline to not surprise our existing customers.

Proof of this solution work as expected: https://build.amazon.com/7486437161

Additional complexity

In the re-purposed clients-peru VS, Our MobileWeblabAndroidClient still use WeblabAndroidClient 1.0, once starting to publish to shared repo we will have

* MobileWeblabAndroidClient-2.0.12345.0
* WeblabAndroidClient-1.0.12345.0

The existing way to use WeblabAndroidClient 1.0 won’t fit, while on the other side we still need to use 1.0 in new-client VS. 

we will use the config in How to let script figure out which destination we are building to, to conditionally let gradle know which dependency version need to get.

IOS doesn’t have such issue since the SPM pulls in package by using “from 2.0.0”, it naturally able to take 2.0.+

