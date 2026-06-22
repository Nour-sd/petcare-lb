import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useNavigate } from "react-router-dom";
import { Dog, Cat, Bird, PlusCircle, AlertTriangle, Calendar } from "lucide-react";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const pets = useQuery(api.pets.getAllPets, {});
  const petsWithDueItems = useQuery(api.pets.getPetsWithDueItems, {});

  const isLoading = pets === undefined;

  const stats = pets ? {
    total: pets.length,
    dogs: pets.filter(p => p.petType === "dog").length,
    cats: pets.filter(p => p.petType === "cat").length,
    others: pets.filter(p => p.petType === "other").length,
  } : { total: 0, dogs: 0, cats: 0, others: 0 };

  const statCards = [
    { title: "Total Pets", value: stats.total, icon: Calendar, color: "bg-blue-500/10 text-blue-500" },
    { title: "Dogs", value: stats.dogs, icon: Dog, color: "bg-orange-500/10 text-orange-500" },
    { title: "Cats", value: stats.cats, icon: Cat, color: "bg-purple-500/10 text-purple-500" },
    { title: "Others", value: stats.others, icon: Bird, color: "bg-green-500/10 text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Admin</p>
        </div>
        <Button onClick={() => navigate("/admin/pets/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Pet
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Due Vaccines/Follow-ups Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-amber-700 dark:text-amber-300">
                  Upcoming Appointments
                </CardTitle>
                <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
                  Pets with vaccines or follow-ups due within the next 7 days
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {petsWithDueItems === undefined ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : petsWithDueItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming appointments in the next 7 days.</p>
            ) : (
              <div className="space-y-3">
                {petsWithDueItems.slice(0, 5).map((pet) => (
                  <div
                    key={pet._id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/admin/pets/${pet._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        pet.petType === "dog" ? "bg-orange-100 text-orange-600" :
                        pet.petType === "cat" ? "bg-purple-100 text-purple-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {pet.petType === "dog" ? <Dog className="h-4 w-4" /> :
                         pet.petType === "cat" ? <Cat className="h-4 w-4" /> :
                         <Bird className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{pet.petName}</p>
                        <p className="text-sm text-muted-foreground">{pet.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {pet.followUpDate && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Follow-up: {new Date(pet.followUpDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {petsWithDueItems.length > 5 && (
                  <Button 
                    variant="link" 
                    className="w-full" 
                    onClick={() => navigate("/admin/pets")}
                  >
                    View all {petsWithDueItems.length} pets
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="secondary"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/admin/pets/new")}
              >
                <PlusCircle className="h-6 w-6" />
                <span>Add New Pet</span>
              </Button>
              <Button
                variant="secondary"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/admin/pets")}
              >
                <Calendar className="h-6 w-6" />
                <span>View All Pets</span>
              </Button>
              <Button
                variant="secondary"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/")}
              >
                <Bird className="h-6 w-6" />
                <span>View Website</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
