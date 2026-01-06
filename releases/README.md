Create a subdirectory in this folder for each release to both sb8 and production. This subdirectory should be nested in a certain way. 

First, start with either `/releases/production` or `/releases/sb8` depending on the release type. Then, create another subdirectory for the date, in YYYYMMDD format, e.g. `/releases/production/19700101`. Subdirectory should be named with the name of the ticket, PMO number, Defect, or other easily referenced value.

If it is a ticket, it should be prefixed with `ticket-`, if it's a PMO, it should be prefixed with `PMO-`, etc. This folder name should also ideally match the branch name.

If you started your branch before a ticket/issue was created, please rename it with `git branch -m <old> <new>`. This may result in a duplicate branch being tracked in gitlab, but that can be pruned easily if necessary.

The subdirectory should contain at least three things:
- deploy.xml for the release
- manifest.xml for the release
- readme for notes about the deployment
- a capture of the "before" state of relevant scripts and objects in case a rapid revert is needed.

Optionally it can contain information about custom record object instances. This may or may not contain the actual objects, as SDF is finicky with account specific values. Consider a CSV for performing a saved CSV import.