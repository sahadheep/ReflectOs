import { Skeleton } from '@/components/ui/skeleton';

export function TaskListSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <Skeleton className="h-10 w-48 mb-6 bg-border/20" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-border/40 rounded-lg">
          <Skeleton className="h-6 w-6 rounded bg-border/20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full max-w-[250px] bg-border/20" />
            <Skeleton className="h-3 w-32 bg-border/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiarySkeleton() {
  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto pt-8">
      <Skeleton className="h-8 w-64 bg-border/20" />
      <Skeleton className="h-10 w-full bg-border/20" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full bg-border/20" />
        <Skeleton className="h-4 w-full bg-border/20" />
        <Skeleton className="h-4 w-[90%] bg-border/20" />
        <Skeleton className="h-4 w-[95%] bg-border/20" />
        <Skeleton className="h-4 w-[80%] bg-border/20" />
      </div>
      <div className="pt-4 flex justify-end">
        <Skeleton className="h-10 w-24 rounded-full bg-border/20" />
      </div>
    </div>
  );
}
