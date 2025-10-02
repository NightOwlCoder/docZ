Can ypi please explain tis to me? particularly r4ad and summarize the last 2 links to wki pages:

---

Stewart Winter
  Today at 11:52
Hi all,
I had a quick sync with Vignesh about the exception we are requesting (for the mShop weblab dial-up).
Time is of the essence because Vignesh goes on vacation at the end of the day and he wants to support our request.  Michael and I will be stuck in OLRs for a few hours so Sergio if you can collaborate with Yiming on updates to the exception request that would be ideal.
Once you think it is ready, please let me and Michael know and we will try to spare some time for a review.
Here are the concerns to address:
The 33/33/33 part is confusing and doesn't really add any value (ie no point in talking about stuff we tried, just focus on what we need)
Provide clarity about the exposure (ie that we are keeping any blast radius as small as possible).  I'm assuming we are only doing 1%, but we aren't making that clear.
Add some intro text to explain why T1/T2 is the right model (mshop appstart weblab blah blah)
It may seem repetitive, but for our answer to 4b make it clear we are doing this because we believe this was caused by a TAA.  We can also add that we would roll back if this turned out not to be true, that we would implement this change and deliver it to a specific RC cut (make sure we have a date there)
Link to the MCM and in particular link to both how we are monitoring for health and how we will roll back.  Make it clear we will monitor for latency
Anything else you can see in this that might be confusing
(edited)
:ty-thankyou:
1
:raised_hands:
1
:ack:
1

45 replies


Yiming Pan
  Today at 11:59
Hi Stewart, should I update this in the request ticket
12:02
I'm not able to directly modify the request since it's submitted from LatencySystem. I will use Correspondence to do the update


Sergio Ibagy
  Today at 13:01
FYI:
wrote a quick QUIP with Yimings help. He is reviewing now, will send it here soon.
:ty-thankyou:
1

13:05
Here is the final version:
https://quip-amazon.com/1qb7AEnkGawP/Approval-Explanation-For-Dialup-of-MBMANDROIDV2CLIENT1083093
once you guys approve Yiming can post in the approval request.
unfortunately he can't change anything in there, not even his own comment, so it will need to be an additional entry on the Correspondence section.


Stewart Winter
  Today at 14:49
Is there any way to retract the exception and request a new one?


Yiming Pan
  Today at 14:50
On that request it sayes
Note: DO NOT clone this request as it will break the Approval process. If you need to make changes to the Approval Plan, please work with the Approvers in making the required changes. Only Approvers can make changes to the Approval Plan.


Michael Bower
  Today at 14:51
@yiminp, did you discuss this with someone from the APP team as well?
I just want to know if there's any internal weblab options available to us


Yiming Pan
  Today at 14:51
I also didn't find a Cancel button on that request
14:51
I have discussed with Steven, he said the only option is providing sev2 or L8 login
14:52
Or using the exception request


Michael Bower
  Today at 14:52
Does providing the L8 login send anything to the L8?


Stewart Winter
  Today at 14:54
I think we need more clarity about why we want to move "fast" with the dial-up (to get to 25% exposure)


Yiming Pan
  Today at 14:54
It won't directly send to L8, but will engage if anything went erong


Michael Bower
  Today at 14:56
It won't directly send to L8, but will engage if anything went erong
What do you mean if anything went wrong?
14:58
I think we need more clarity about why we want to move "fast" with the dial-up (to get to 25% exposure)
It's not that we want to move fast, it's that that we want to measure T1 vs T2 instead of C vs T2, Weblab UI is interpreting it as we are launching something because we are no longer doing C vs T2.
C == T1, it's the same code path
We want to measure T1 vs T2 to ensure that default treatments aren't somehow polluting our data. According to Andrew, this is a best practice in mshop
15:00
In the mobile api, users get to set a default treatment. We set ours as C. So instead of getting null for no treatment, that weblab evaluates to C. My understanding from Andrew is the app start wrapper cache can have some issues with that, so T1 vs T2 is more clearly in the experiment and does not contain default treatments


Yiming Pan
  Today at 15:00
What do you mean if anything went wrong?
if dial-up caused service to crash and caused a sev-2, this is more of recording purpose


Sergio Ibagy
  Today at 15:04
I'm back from lunch, anything on the QUIP I should fix? Will we add as a new Comment or ask Vignesh to cancel it?


Michael Bower
  Today at 15:05
I left a comment in the quip about clarifying how and what we're dialing up


Sergio Ibagy
  Today at 15:06
What a :hankey:
image.png
 
image.png


Michael Bower
  Today at 15:06
did you try refreshing?
15:06
this was my comment
Specify dial up + exposure percentages. I.e. this weblab will be at 50% T1/T2 and we'll dial up the exposure to 1%, 5%, 25%, etc...


Sergio Ibagy
  Today at 15:09
yep, a refresh did the trick :man-shrugging:


Stewart Winter
  Today at 15:11
We want to measure T1 vs T2 to ensure that default treatments aren't somehow polluting our data. According to Andrew, this is a best practice in mshop
Can we add something to this effect in the Exposure & Risk Mitigation section?
Perhaps something like "We will start the dial up process this Monday, 8/18. The weblab will be at 50% T1/T2 and we'll dial up the exposure control using mShop's best practices schedule as follow:"
:+1:
1



Stewart Winter
  1 hour ago
OK, so what's our conclusion about how to get this to Vignesh ... I confirmed that I have no ability to edit the document.


Sergio Ibagy
  1 hour ago
the only "update" we can do is add a new entry to the Correspondence window :woozy_face:
:yes:
1



Michael Bower
  1 hour ago
can we just ignore it and put his alias in the weblab UI?


Sergio Ibagy
  1 hour ago
I guess "that" would be the best approach since the beginning, but at this point, if we do that, I think now we do need to ask for permission
before was only forgiveness :mild-panic-intensifies:
:sob:
1



Michael Bower
  42 minutes ago
oh yea, we should give him a heads up


Sergio Ibagy
  40 minutes ago
Can one of you Seattle's beings get him in a hallway between meetings and tell him to ignore/close that approval request? maybe even print the QUIP and give to him :smile:


Stewart Winter
  40 minutes ago
I will do that
:ty-thankyou:
3



Sergio Ibagy
  37 minutes ago
@yiminp what about the latency SIM? who can close it? Did you talk to anyone about that?


Yiming Pan
  36 minutes ago
That ticket has been closed, I discussed with msf current oncall offline


Sergio Ibagy
  36 minutes ago
:thinking_face: I thought that was the reason we could not dialup?


Michael Bower
  34 minutes ago
no, that was a misunderstanding of how the system works


Yiming Pan
  34 minutes ago
Close ticket may not remove the policy violation


Michael Bower
  34 minutes ago
the WeblabUI does not look at the status of that ticket to determine if the latency regression has been resolved
:yes:
1



Sergio Ibagy
  33 minutes ago
so we need to resolve a PE risk? how? by dialing up again? feels like chicken/egg?


Yiming Pan
  32 minutes ago
From the doc, it may takes 72 hours to remove the latency issue.


Stewart Winter
  31 minutes ago
Can we add something about that in the doc too?


Yiming Pan
  31 minutes ago
So central latency's suggestion is equally divide the treatment and wait for 72 hours


Michael Bower
  26 minutes ago
I believe what's happening is that we dialed up C vs T2, T2 showed a latency regression compared to a baseline of C. We're trying to dial up T2 again with a baseline of T1. So it appears to the policy tool that we're going to ignore the fact T2 has a regression against C and are going to go ahead and measure T2 against something else.
The way I believe it wants us to resolve this is to
Dial down the weblab, fix the code issue, deploy the fix. Dial up C vs T2 and verify the code change fixed the regression
15:53
but that's not what we're actually trying to do here


Sergio Ibagy
  23 minutes ago
I'm still lost how they monitor/control this...


Michael Bower
  19 minutes ago
It would be worth reading through these wikis
https://w.amazon.com/bin/view/Latency/Weblab_Latency_Policies/
https://w.amazon.com/bin/view/Latency/ArmoredLatency/Weblab_Regression_Helper/
Roughly it's
Weblab UI -> WeblabPolicyAPI -> ArmoredLatency
Where ArmoredLatency tells WeblabPolicyAPI whether or not the weblab can be dialed up or not