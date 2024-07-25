import ComingSoon from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authFetcher } from "@/lib/fetcher";
import { Project } from "@/models/models";
import { navigationStateStore } from "@/store/store";
import { useUser } from "@propelauth/nextjs/client";
import { Tag } from "lucide-react";
import { Boxes, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import useSWR from "swr";

function EventAnalytics({ eventId }: { eventId: string }) {
  const { accessToken } = useUser();
  const project_id = navigationStateStore((state) => state.project_id);
  const { data: selectedProject }: { data: Project } = useSWR(
    project_id ? [`/api/projects/${project_id}`, accessToken] : null,
    ([url, accessToken]) => authFetcher(url, accessToken, "GET"),
    {
      keepPreviousData: true,
    },
  );

  const eventFilters = {
    // created_at_start: dateRange?.created_at_start,
    // created_at_end: dateRange?.created_at_end,
  };

  // In the Record, find the event with the same id as the one passed in the props
  const eventsAsArray = Object.entries(selectedProject.settings?.events || {});
  const event = eventsAsArray.find(([, event]) => event.id === eventId)?.[1];


  const { data: totalNbDetections } = useSWR(
    project_id
      ? [
        `/api/explore/${encodeURI(project_id)}/aggregated/events/${encodeURI(eventId)}`,
        accessToken,
        "total_nb_events",
        JSON.stringify(eventFilters),
      ]
      : null,
    ([url, accessToken]) =>
      authFetcher(url, accessToken, "POST", {
        metrics: ["total_nb_events"],
        filters: eventFilters,
      }),
    {
      keepPreviousData: true,
    },
  );

  const { data: F1Score } = useSWR(
    project_id && event?.score_range_settings?.score_type !== "range"
      ? [
        `/api/explore/${encodeURI(project_id)}/aggregated/events/${encodeURI(eventId)}`,
        accessToken,
        "f1_score",
        "precision",
        "recall",
        JSON.stringify(eventFilters),
      ]
      : null,
    ([url, accessToken]) =>
      authFetcher(url, accessToken, "POST", {
        metrics: ["f1_score", "precision", "recall"],
        filters: eventFilters,
      }),
    {
      keepPreviousData: true,
    },
  );

  const { data: RegressionMetrics } = useSWR(
    project_id && event?.score_range_settings?.score_type === "range"
      ? [
        `/api/explore/${encodeURI(project_id)}/aggregated/events/${encodeURI(eventId)}`,
        accessToken,
        "mean_squared_error",
        "r_squared",
        JSON.stringify(eventFilters),
      ]
      : null,
    ([url, accessToken]) =>
      authFetcher(url, accessToken, "POST", {
        metrics: ["mean_squared_error", "r_squared"],
        filters: eventFilters,
      }),
    {
      keepPreviousData: true,
    },
  );

  if (!project_id || !selectedProject) {
    return <></>;
  }

  console.log(totalNbDetections);
  console.log("Mean squarred error: ", RegressionMetrics)

  return (
    <>
      <div>
        <h4 className="text-xl font-bold">Event : "{event?.event_name}"</h4>
      </div>
      {/* if the score type is range but there is not enough data to compute the scores, we display a not enough feedback message */}
      {(!RegressionMetrics?.mean_squared_error) && (event?.score_range_settings?.score_type == "range") && (
        <>
          <Card className="bg-secondary">
            <CardHeader>
              <div className="flex">
                <Tag className="mr-4 h-16 w-16 hover:text-green-500 transition-colors" />

                <div className="flex flex-grow justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight mb-0">
                      <div className="flex flex-row place-items-center">
                        Unlock event metrics !
                      </div>
                    </CardTitle>
                    <CardDescription className="flex justify-between flex-col text-muted-foreground space-y-0.5">
                      <p>
                        Give us more feedback to compute the Mean Squared Error and the R-squared.
                      </p>
                    </CardDescription>
                  </div>

                  <Link href="/org/transcripts/tasks">
                    <Button variant="default">
                      Give feedback
                      <ChevronRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card></>
      )}
      {/* if the score type is confidence or category but there is not enough data to compute the scores, we display a not enough feedback message */}
      {(!F1Score?.f1_score) && (event?.score_range_settings?.score_type != "range") && (
        <>
          <Card className="bg-secondary">
            <CardHeader>
              <div className="flex">
                <Tag className="mr-4 h-16 w-16 hover:text-green-500 transition-colors" />

                <div className="flex flex-grow justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight mb-0">
                      <div className="flex flex-row place-items-center">
                        Unlock event metrics !
                      </div>
                    </CardTitle>
                    <CardDescription className="flex justify-between flex-col text-muted-foreground space-y-0.5">
                      <p>
                        Label more data to compute the F1-score, Precision and
                        Recall.
                      </p>
                    </CardDescription>
                  </div>

                  <Link href="/org/transcripts/tasks">
                    <Button variant="default">
                      Label data
                      <ChevronRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        </>
      )}
      {/* In any case we display the Total number of descriptions card */}
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Total Nb of detections</CardDescription>
            </CardHeader>
            <CardContent>
              {(totalNbDetections?.total_nb_events === undefined && (
                <p>...</p>
              )) || (
                  <p className="text-xl">{totalNbDetections?.total_nb_events}</p>
                )}
            </CardContent>
          </Card>
          {/* If we have enough data to compute the scores, we display the F1-score, Precision and Recall cards */}
          {event?.score_range_settings?.score_type != "range" && (
            <>
              <Card>
                <CardHeader>
                  <CardDescription>F1-score</CardDescription>
                </CardHeader>
                <CardContent>
                  {(F1Score?.f1_score && (
                    <p className="text-xl">{F1Score?.f1_score.toFixed(2)}</p>
                  )) ||
                    (!F1Score?.f1_score && <p className="text-xl"> ... </p>)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Precision</CardDescription>
                </CardHeader>
                <CardContent>
                  {(F1Score?.f1_score && (
                    <p className="text-xl">{F1Score?.precision.toFixed(2)}</p>
                  )) ||
                    (!F1Score?.f1_score && <p className="text-xl">...</p>)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Recall</CardDescription>
                </CardHeader>
                <CardContent>
                  {(F1Score?.f1_score && (
                    <p className="text-xl">{F1Score?.recall.toFixed(2)}</p>
                  )) ||
                    (!F1Score?.f1_score && <p className="text-xl">...</p>)}
                </CardContent>
              </Card>
            </>
          )}
          {/* If we have enough data to compute the scores, we display the Mean Square Error and the R-squared */}
          {event?.score_range_settings?.score_type == "range" && (
            <>
              <Card>
                <CardHeader>
                  <CardDescription>Mean Squared Error</CardDescription>
                </CardHeader>
                <CardContent>
                  {(RegressionMetrics?.mean_squared_error !== undefined && RegressionMetrics?.mean_squared_error !== null) ? (
                    <p className="text-xl">
                      {RegressionMetrics?.mean_squared_error.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-xl">...</p>
                  )}

                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>R-squared</CardDescription>
                </CardHeader>
                <CardContent>
                  {(RegressionMetrics?.mean_squared_error !== undefined && RegressionMetrics?.mean_squared_error !== null) ? (
                    <p className="text-xl">
                      {RegressionMetrics?.r_squared.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-xl">...</p>
                  )}

                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default EventAnalytics;
