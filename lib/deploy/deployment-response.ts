import { DeploymentStatus, type Deployment } from "@prisma/client";
import { NextResponse } from "next/server";

/** Return 422 when processing failed so clients don't treat FAILED deployments as success. */
export function jsonAfterDeploymentProcess(deployment: Deployment | null) {
  if (!deployment) {
    return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
  }

  if (deployment.status === DeploymentStatus.FAILED) {
    return NextResponse.json(
      {
        error: deployment.errorMessage ?? "Deployment failed",
        deployment,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ deployment }, { status: 201 });
}
