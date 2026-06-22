import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Dog, Cat, Bird, Plus, Trash2, ArrowLeft, Save, Mars, Venus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import PaymentsTable, { type Payment } from "./_components/PaymentsTable.tsx";

type PetType = "dog" | "cat" | "other";
type Gender = "male" | "female";

interface Vaccine {
  name: string;
  date: string;
}

export default function AddPet() {
  const navigate = useNavigate();
  const createPet = useMutation(api.pets.createPet);
  
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
  const [vaccines, setVaccines] = useState<Vaccine[]>([{ name: "", date: "" }]);
  const [payments, setPayments] = useState<Payment[]>([]);

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
    setIsSubmitting(true);

    const sessionToken = localStorage.getItem("admin_session_token") ?? "";

    try {
      const validVaccines = vaccines.filter(v => v.name && v.date);
      const validPayments = payments.filter(p => p.description);

      await createPet({
        sessionToken,
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

      toast.success("Pet added successfully!");
      navigate("/admin/pets");
    } catch {
      toast.error("Failed to add pet", { description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/pets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Pet</h1>
          <p className="text-muted-foreground mt-1">Enter the pet's information below</p>
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
                  <Label htmlFor="petName">Pet Name *</Label>
                  <Input
                    id="petName"
                    placeholder="Buddy"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Smith"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    placeholder="Golden Retriever"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age (if DOB unknown)</Label>
                  <Input
                    id="age"
                    placeholder="2 years"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              {/* Pet Type */}
              <div className="space-y-3">
                <Label>Pet Type *</Label>
                <RadioGroup
                  value={formData.petType}
                  onValueChange={(value) => setFormData({ ...formData, petType: value as PetType })}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dog" id="type-dog" />
                    <Label htmlFor="type-dog" className="flex items-center gap-2 cursor-pointer">
                      <Dog className="h-4 w-4 text-orange-500" />Dog
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cat" id="type-cat" />
                    <Label htmlFor="type-cat" className="flex items-center gap-2 cursor-pointer">
                      <Cat className="h-4 w-4 text-purple-500" />Cat
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="type-other" />
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
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male" className="flex items-center gap-2 cursor-pointer">
                      <Mars className="h-4 w-4 text-blue-500" />Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" />
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
                  <CardDescription>Record vaccination history</CardDescription>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddVaccine}>
                  <Plus className="h-4 w-4 mr-1" />Add Vaccine
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaccines.map((vaccine, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Vaccine Name</Label>
                    <Input
                      placeholder="Rabies"
                      value={vaccine.name}
                      onChange={(e) => handleVaccineChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={vaccine.date}
                      onChange={(e) => handleVaccineChange(index, "date", e.target.value)}
                    />
                  </div>
                  {vaccines.length > 1 && (
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
              ))}
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
                  placeholder="List any current medications..."
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drNote">Doctor's Notes</Label>
                <Textarea
                  id="drNote"
                  placeholder="Any additional notes from the doctor..."
                  value={formData.drNote}
                  onChange={(e) => setFormData({ ...formData, drNote: e.target.value })}
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
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PaymentsTable payments={payments} onChange={setPayments} />
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/admin/pets")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Pet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
