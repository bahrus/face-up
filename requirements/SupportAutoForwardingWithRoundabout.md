# Support Auto Forwarding With Roundabout Merging

---

## Human Ask

I am interested in making it really easy to provide property forwarding to this feature for those who make use of the [roundabout library](https://github.com/bahrus/roundabout).

The *time-ticker* custom element library is such a scenario.  I've copied that project into this folder temporarily for easy inspection.  Note how, in that project, the cef.json file is built from cef.mjs via npm run build for good typescript support with a kiro hook.  Look closely at the "merges" section to see how property forwarding is done.  The roundabout library actually creates the properties automaically from these merges.

Please create an RAConfig.mjs in this project that provides similar property forwarding configuration for all the relevant forwarding, which can then be imported by projects like time-ticker. 