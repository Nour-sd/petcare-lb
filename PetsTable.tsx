import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty.tsx";
import { Search, PlusCircle, Dog, Cat, Bird, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useDebounce } from "@/hooks/use-debounce.ts";

type PetTypeFilter = "all" | "dog" | "cat" | "other";

export default function PetsTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [petTypeFilter, setPetTypeFilter] = useState<PetTypeFilter>("all");
  
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  
  const pets = useQuery(api.pets.searchPets, {
    searchTerm: debouncedSearch,
    petType: petTypeFilter,
  });

  const isLoading = pets === undefined;

  const filterButtons: { label: string; value: PetTypeFilter; icon: React.ElementType }[] = [
    { label: "All", value: "all", icon: Search },
    { label: "Dogs", value: "dog", icon: Dog },
    { label: "Cats", value: "cat", icon: Cat },
    { label: "Others", value: "other", icon: Bird },
  ];

  const isDueWithinWeek = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= now && date <= oneWeekFromNow;
  };

  const hasDueItems = (pet: NonNullable<typeof pets>[0]) => {
    if (isDueWithinWeek(pet.followUpDate)) return true;
    if (pet.vaccines?.some(v => isDueWithinWeek(v.date))) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Pets</h1>
          <p className="text-muted-foreground mt-1">Manage and search pet records</p>
        </div>
        <Button onClick={() => navigate("/admin/pets/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Pet
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pet name, owner name, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={petTypeFilter === btn.value ? "default" : "secondary"}
                size="sm"
                onClick={() => setPetTypeFilter(btn.value)}
                className="gap-2"
              >
                <btn.icon className="h-4 w-4" />
                {btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <span>Highlighted rows indicate pets with vaccines or follow-ups due within 7 days</span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="p-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Dog />
                  </EmptyMedia>
                  <EmptyTitle>No pets found</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm || petTypeFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add your first pet to get started"}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" onClick={() => navigate("/admin/pets/new")}>
                    Add New Pet
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pets.map((pet) => (
                    <TableRow
                      key={pet._id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50 transition-colors",
                        hasDueItems(pet) && "bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                      )}
                      onClick={() => navigate(`/admin/pets/${pet._id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {hasDueItems(pet) && (
                            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          )}
                          {pet.petName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                          pet.petType === "dog" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                          pet.petType === "cat" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                          pet.petType === "other" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        )}>
                          {pet.petType === "dog" && <Dog className="h-3 w-3" />}
                          {pet.petType === "cat" && <Cat className="h-3 w-3" />}
                          {pet.petType === "other" && <Bird className="h-3 w-3" />}
                          {pet.petType.charAt(0).toUpperCase() + pet.petType.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>{pet.ownerName}</TableCell>
                      <TableCell>{pet.phoneNumber}</TableCell>
                      <TableCell>{pet.breed || "-"}</TableCell>
                      <TableCell>
                        {pet.followUpDate ? (
                          <span className={cn(
                            isDueWithinWeek(pet.followUpDate) && "text-amber-600 dark:text-amber-400 font-medium"
                          )}>
                            {new Date(pet.followUpDate).toLocaleDateString()}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/admin/pets/${pet._id}`, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
