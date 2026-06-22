import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Dog, Cat, Bird, Plus, Trash2, ArrowLeft, Save, Pencil, X, Mars, Venus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import PaymentsTable, { type Payment } from "./_components/PaymentsTable.tsx";

type PetType = "dog" | "cat" | "other";
type Gender = "male" | "female";

interface Vaccine {
  name: string;
  date: string;
}

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = useQuery(api.pets.getPetById, id ? { id: id as Id<"pets"> } : "skip");
  const updatePet = useMutation(api.pets.updatePet);
  const deletePet = useMutation(api.pets.deletePet);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
    ownerName: "",
    phoneNumber: "",
    dateOfBirth: "",
    age: "",
    petType: "dog" as PetType,
    gender: "" as Gender | "",
    breed: "",
    medication: "",
    drNote: "",
    followUpDate: "",
  });
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (pet) {
      setFormData({
        petName: pet.petName,
        ownerName: pet.ownerName,
        phoneNumber: pet.phoneNumber,
        dateOfBirth: pet.dateOfBirth || "",
        age: pet.age || "",
        petType: pet.petType,
        gender: (pet.gender as Gender | undefined) || "",
        breed: pet.breed || "",
        medication: pet.medication || "",
        drNote: pet.drNote || "",
        followUpDate: pet.followUpDate || "",
      });
      setVaccines(pet.vaccines || []);
      setPayments((pet.payments as Payment[] | undefined) || []);
    }
  }, [pet]);

  const handleAddVaccine = () => {
    setVaccines([...vaccines, { name: "", date: "" }]);
  };

  const handleRemoveVaccine = (index: number) => {
    setVaccines(vaccines.filter((_, i) => i !== index));
  };

  const handleVaccineChange = (index: number, field: keyof Vaccine, value: string) => {
    const updated = [...vaccines];
    updated[index][field] = value;
    setVaccines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);

    const sessionToken = localStorage.getItem("admin_session_token") ?? "";

    try {
      const validVaccines = vaccines.filter(v => v.name && v.date);
      const validPayments = payments.filter(p => p.description);

      await updatePet({
        sessionToken,
        id: id as Id<"pets">,
        ...formData,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        age: formData.age || undefined,
        breed: formData.breed || undefined,
        medication: formData.medication || undefined,
        drNote: formData.drNote || undefined,
        followUpDate: formData.followUpDate || undefined,
        vaccines: validVaccines.length > 0 ? validVaccines : undefined,
        payments: validPayments.length > 0 ? validPayments : undefined,
      });

      toast.success("Pet updated successfully!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update pet", { description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this pet record? This action cannot be undone.")) return;

    const sessionToken = localStorage.getItem("admin_session_token") ?? "";

    try {
      await deletePet({ sessionToken, id: id as Id<"pets"> });
      toast.success("Pet deleted successfully");
      navigate("/admin/pets");
    } catch {
      toast.error("Failed to delete pet");
    }
  };

  if (pet === undefined) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (pet === null) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground">Pet not found</h2>
        <p className="text-muted-foreground mt-2">The pet record you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate("/admin/pets")}>Back to Pets</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/pets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{pet.petName}</h1>
            <p className="text-muted-foreground mt-1">Pet Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />Cancel
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petName">Pet Name</Label>
                  <Input
                    id="petName"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Pet Type */}
              <div className="space-y-3">
                <Label>Pet Type</Label>
                <RadioGroup
                  value={formData.petType}
                  onValueChange={(value) => setFormData({ ...formData, petType: value as PetType })}
                  className="flex flex-wrap gap-4"
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dog" id="type-dog" disabled={!isEditing} />
                    <Label htmlFor="type-dog" className="flex items-center gap-2 cursor-pointer">
                      <Dog className="h-4 w-4 text-orange-500" />Dog
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cat" id="type-cat" disabled={!isEditing} />
                    <Label htmlFor="type-cat" className="flex items-center gap-2 cursor-pointer">
                      <Cat className="h-4 w-4 text-purple-500" />Cat
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="type-other" disabled={!isEditing} />
                    <Label htmlFor="type-other" className="flex items-center gap-2 cursor-pointer">
                      <Bird className="h-4 w-4 text-green-500" />Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                  className="flex flex-wrap gap-4"
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" disabled={!isEditing} />
                    <Label htmlFor="gender-male" className="flex items-center gap-2 cursor-pointer">
                      <Mars className="h-4 w-4 text-blue-500" />Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" disabled={!isEditing} />
                    <Label htmlFor="gender-female" className="flex items-center gap-2 cursor-pointer">
                      <Venus className="h-4 w-4 text-pink-500" />Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vaccines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vaccines</CardTitle>
                  <CardDescription>Vaccination records</CardDescription>
                </div>
                {isEditing && (
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddVaccine}>
                    <Plus className="h-4 w-4 mr-1" />Add Vaccine
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaccines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No vaccines recorded</p>
              ) : (
                vaccines.map((vaccine, index) => (
                  <div key={index} className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Vaccine Name</Label>
                      <Input
                        value={vaccine.name}
                        onChange={(e) => handleVaccineChange(index, "name", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={vaccine.date}
                        onChange={(e) => handleVaccineChange(index, "date", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveVaccine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Medical Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Medication and doctor's notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Current Medication</Label>
                <Textarea
                  id="medication"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drNote">Doctor's Notes</Label>
                <Textarea
                  id="drNote"
                  value={formData.drNote}
                  onChange={(e) => setFormData({ ...formData, drNote: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PaymentsTable payments={payments} onChange={setPayments} disabled={!isEditing} />
        </motion.div>

        {/* Submit */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
