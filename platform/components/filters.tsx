import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigationStateStore } from "@/store/store";
import { dataStateStore } from "@/store/store";
import {
  Annoyed,
  Calendar,
  CandlestickChart,
  Flag,
  Frown,
  Languages,
  ListFilter,
  Meh,
  Smile,
  SmilePlus,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import React from "react";

const FilterComponent = ({}: React.HTMLAttributes<HTMLDivElement>) => {
  const setTasksColumnsFilters = navigationStateStore(
    (state) => state.setTasksColumnsFilters,
  );
  const tasksColumnsFilters = navigationStateStore(
    (state) => state.tasksColumnsFilters,
  );

  let eventFilter: string[] | null = null;
  let flagFilter: string | null = null;
  let languageFilter: string | null = null;
  let sentimentFilter: string | null = null;
  let lastEvalSourceFilter: string | null = null;

  for (const [key, value] of Object.entries(tasksColumnsFilters)) {
    if (key === "flag" && (typeof value === "string" || value === null)) {
      flagFilter = value;
    }
    if (key === "event" && typeof value === "string") {
      eventFilter = eventFilter == null ? [value] : eventFilter.concat(value);
    } else {
      eventFilter = null;
    }
    if (key === "language" && typeof value === "string") {
      languageFilter = value;
    }
    if (key === "sentiment" && typeof value === "string") {
      sentimentFilter = value;
    }
    if (key === "lastEvalSource" && typeof value === "string") {
      lastEvalSourceFilter = value;
    }
  }

  const selectedProject = dataStateStore((state) => state.selectedProject);

  if (!selectedProject) {
    return <></>;
  }

  const events = selectedProject.settings?.events;

  return (
    <div>
      <DropdownMenu>
        <div className="flex align-items">
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          {flagFilter !== null && (
            <Button
              className={`ml-2 color: ${flagFilter === "success" ? "green" : "red"} `}
              variant="outline"
              onClick={() => {
                setTasksColumnsFilters((prevFilters) => ({
                  ...prevFilters,
                  flag: null,
                }));
              }}
            >
              {flagFilter}
              <X className="h-4 w-4 ml-2" />
            </Button>
          )}
          {eventFilter !== null && (
            <Button
              className="ml-2"
              variant="outline"
              onClick={() => {
                setTasksColumnsFilters((prevFilters) => ({
                  ...prevFilters,
                  event: null,
                }));
              }}
            >
              {eventFilter}
              <X className="h-4 w-4 ml-2" />
            </Button>
          )}
          {languageFilter !== null && (
            <Button
              className="ml-2"
              variant="outline"
              onClick={() => {
                setTasksColumnsFilters((prevFilters) => ({
                  ...prevFilters,
                  language: null,
                }));
              }}
            >
              {languageFilter}
              <X className="h-4 w-4 ml-2" />
            </Button>
          )}
          {sentimentFilter !== null && (
            <Button
              className="ml-2"
              variant="outline"
              onClick={() => {
                setTasksColumnsFilters((prevFilters) => ({
                  ...prevFilters,
                  sentiment: null,
                }));
              }}
            >
              {sentimentFilter}
              <X className="h-4 w-4 ml-2" />
            </Button>
          )}
          {lastEvalSourceFilter !== null && (
            <Button
              className="ml-2"
              variant="outline"
              onClick={() => {
                setTasksColumnsFilters((prevFilters) => ({
                  ...prevFilters,
                  lastEvalSource: null,
                }));
              }}
            >
              {lastEvalSourceFilter}
              <X className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filters to apply</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Flag */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Flag className="h-4 w-4 mr-2" />
              <span>Eval</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      flag: "success",
                    }));
                  }}
                  style={{
                    color: flagFilter === "success" ? "green" : "inherit",
                  }}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  <span>Success</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      flag: "failure",
                    }));
                  }}
                  style={{
                    color: flagFilter === "failure" ? "red" : "inherit",
                  }}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  <span>Failure</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Events */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <span>Events</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="overflow-y-auto">
                {events &&
                  Object.entries(events).map(([event_name, event]) => {
                    return (
                      <DropdownMenuItem
                        key={event.id}
                        onClick={() => {
                          setTasksColumnsFilters((prevFilters) => ({
                            ...prevFilters,
                            event: event_name,
                          }));
                        }}
                        style={{
                          color: eventFilter?.includes(event_name)
                            ? "green"
                            : "inherit",
                        }}
                      >
                        {event_name}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Language */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="h-4 w-4 mr-2" />
              <span>Language</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "en",
                    }));
                  }}
                  style={{
                    color: languageFilter === "en" ? "green" : "inherit",
                  }}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "fr",
                    }));
                  }}
                  style={{
                    color: languageFilter === "fr" ? "green" : "inherit",
                  }}
                >
                  French
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "es",
                    }));
                  }}
                  style={{
                    color: languageFilter === "es" ? "green" : "inherit",
                  }}
                >
                  Spanish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "de",
                    }));
                  }}
                  style={{
                    color: languageFilter === "de" ? "green" : "inherit",
                  }}
                >
                  German
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "it",
                    }));
                  }}
                  style={{
                    color: languageFilter === "it" ? "green" : "inherit",
                  }}
                >
                  Italian
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "pt",
                    }));
                  }}
                  style={{
                    color: languageFilter === "pt" ? "green" : "inherit",
                  }}
                >
                  Portuguese
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "zh-cn",
                    }));
                  }}
                  style={{
                    color: languageFilter === "zh-cn" ? "green" : "inherit",
                  }}
                >
                  Chinese
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      language: "rus",
                    }));
                  }}
                  style={{
                    color: languageFilter === "rus" ? "green" : "inherit",
                  }}
                >
                  Russian
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Sentiment */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SmilePlus className="h-4 w-4 mr-2" />
              <span>Sentiment</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      sentiment: "positive",
                    }));
                  }}
                  style={{
                    color: sentimentFilter === "positive" ? "green" : "inherit",
                  }}
                >
                  <Smile className="h-4 w-4 mr-2" />
                  <span>Positive</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      sentiment: "neutral",
                    }));
                  }}
                  style={{
                    color: sentimentFilter === "neutral" ? "green" : "inherit",
                  }}
                >
                  <Meh className="h-4 w-4 mr-2" />
                  <span>Neutral</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      sentiment: "mixed",
                    }));
                  }}
                  style={{
                    color: sentimentFilter === "mixed" ? "green" : "inherit",
                  }}
                >
                  <Annoyed className="h-4 w-4 mr-2" />
                  <span>Mixed</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      sentiment: "negative",
                    }));
                  }}
                  style={{
                    color: sentimentFilter === "negative" ? "red" : "inherit",
                  }}
                >
                  <Frown className="h-4 w-4 mr-2" />
                  <span>Negative</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Last Eval Source */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CandlestickChart className="h-4 w-4 mr-2" />
              <span>Last Eval Source</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      lastEvalSource: "phospho",
                    }));
                  }}
                  style={{
                    color:
                      lastEvalSourceFilter === "phospho" ? "green" : "inherit",
                  }}
                >
                  phospho
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTasksColumnsFilters((prevFilters) => ({
                      ...prevFilters,
                      lastEvalSource: "user",
                    }));
                  }}
                  style={{
                    color:
                      lastEvalSourceFilter === "user" ? "green" : "inherit",
                  }}
                >
                  user
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterComponent;
