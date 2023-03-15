import type { MilestoneEvent } from "@octokit/webhooks-types";

import { MilestoneAction } from "./base";
import { CreateMilestoneIssue } from "./create-issue";
import { SyncMilestoneIssue } from "./sync-issue";

export { MilestoneAction, CreateMilestoneIssue, SyncMilestoneIssue };

export type { MilestoneEvent };
