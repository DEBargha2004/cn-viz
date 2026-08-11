import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu, Network } from "lucide-react";
import { ChapterNavList } from "./ChapterNavList";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSpeedControl } from "./GlobalSpeedControl";
import { type ChapterMeta } from "../../lib/content";
import { Link } from "react-router-dom";

interface MobileTopBarProps {
  chapters: ChapterMeta[];
}

export function MobileTopBar({ chapters }: MobileTopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/80 px-4 md:hidden bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2.5 font-bold">
        <div className="size-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
          <Network className="size-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-tight leading-none text-foreground">
            CN-Viz
          </span>
          <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
            Networks Explorer
          </span>
        </div>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="cursor-pointer rounded-xl hover:bg-accent">
              <Menu className="size-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="flex flex-col h-full w-[290px] p-0 bg-sidebar border-r border-sidebar-border">
          <SheetHeader className="p-4 border-b border-sidebar-border text-left">
            <SheetTitle className="flex items-center gap-2.5 font-bold text-sm">
              <div className="size-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Network className="size-4" />
              </div>
              <span className="text-foreground">CN-Viz Navigation</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-3">
            <ChapterNavList chapters={chapters} onItemClick={() => setOpen(false)} />
          </div>

          <div className="border-t border-sidebar-border p-3.5 flex flex-col gap-3 bg-sidebar/60 mt-auto">
            <GlobalSpeedControl />
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
