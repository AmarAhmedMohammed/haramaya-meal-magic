import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useCafeterias } from "@/hooks/useFirestore";
import { createCafeteria, updateCafeteria } from "@/lib/firestore";
import { Cafeteria } from "@/types";
import { Plus, Building2, MapPin, Clock, Edit, Trash2 } from "lucide-react";

export default function Cafeterias() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { cafeterias, loading } = useCafeterias();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCafeteria, setSelectedCafeteria] = useState<Cafeteria | null>(
    null
  );

  const [formData, setFormData] = useState({
    cafeteriaId: "",
    name: "",
    nameAmharic: "",
    location: "",
    openHours: { start: "06:00", end: "20:00" },
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      cafeteriaId: "",
      name: "",
      nameAmharic: "",
      location: "",
      openHours: { start: "06:00", end: "20:00" },
      isActive: true,
    });
  };

  const handleAddCafeteria = async () => {
    if (!formData.cafeteriaId || !formData.name || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCafeteria({
        cafeteriaId: formData.cafeteriaId,
        name: formData.name,
        nameAmharic: formData.nameAmharic,
        location: formData.location,
        openHours: formData.openHours,
        isActive: formData.isActive,
        allowedCafeterias: [],
      });

      toast({
        title: "Cafeteria Added",
        description: `${formData.name} has been added successfully.`,
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cafeteria.",
        variant: "destructive",
      });
    }
  };

  const handleEditCafeteria = async () => {
    if (!selectedCafeteria || !formData.name || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCafeteria(selectedCafeteria.cafeteriaId, {
        name: formData.name,
        nameAmharic: formData.nameAmharic,
        location: formData.location,
        openHours: formData.openHours,
        isActive: formData.isActive,
      });

      toast({
        title: "Cafeteria Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setSelectedCafeteria(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cafeteria.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (cafeteria: Cafeteria) => {
    setSelectedCafeteria(cafeteria);
    setFormData({
      cafeteriaId: cafeteria.cafeteriaId,
      name: cafeteria.name,
      nameAmharic: cafeteria.nameAmharic || "",
      location: cafeteria.location,
      openHours: cafeteria.openHours,
      isActive: cafeteria.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (cafeteria: Cafeteria) => {
    setSelectedCafeteria(cafeteria);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {t("cafeterias")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage university cafeterias and dining halls
            </p>
          </div>
          <Button
            variant="hero"
            className="gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Cafeteria
          </Button>
        </div>

        {/* Cafeterias Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading cafeterias...</p>
          </div>
        ) : cafeterias.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cafeterias found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add First Cafeteria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cafeterias.map((cafeteria, index) => (
              <motion.div
                key={cafeteria.cafeteriaId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {cafeteria.name}
                          </CardTitle>
                          {cafeteria.nameAmharic && (
                            <p className="text-sm text-muted-foreground">
                              {cafeteria.nameAmharic}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={cafeteria.isActive ? "cafe" : "none"}>
                        {cafeteria.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {cafeteria.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {cafeteria.openHours.start} - {cafeteria.openHours.end}
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(cafeteria)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(cafeteria)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Cafeteria Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Cafeteria</DialogTitle>
            <DialogDescription>
              Enter the cafeteria information to add it to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cafeteriaId">Cafeteria ID *</Label>
              <Input
                id="cafeteriaId"
                placeholder="CAF001"
                value={formData.cafeteriaId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cafeteriaId: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (English) *</Label>
              <Input
                id="name"
                placeholder="Main Cafeteria"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameAmharic">Name (Amharic)</Label>
              <Input
                id="nameAmharic"
                placeholder="ዋና ካፌቴሪያ"
                value={formData.nameAmharic}
                onChange={(e) =>
                  setFormData({ ...formData, nameAmharic: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Building A, Ground Floor"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Opening Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.openHours.start}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openHours: {
                        ...formData.openHours,
                        start: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Closing Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.openHours.end}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openHours: { ...formData.openHours, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-input"
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Active (accepting students)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="hero" onClick={handleAddCafeteria}>
              Add Cafeteria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cafeteria Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Cafeteria</DialogTitle>
            <DialogDescription>
              Update the cafeteria information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Cafeteria ID</Label>
              <Input
                value={formData.cafeteriaId}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name (English) *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nameAmharic">Name (Amharic)</Label>
              <Input
                id="edit-nameAmharic"
                value={formData.nameAmharic}
                onChange={(e) =>
                  setFormData({ ...formData, nameAmharic: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Opening Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.openHours.start}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openHours: {
                        ...formData.openHours,
                        start: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">Closing Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.openHours.end}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openHours: { ...formData.openHours, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-input"
              />
              <Label htmlFor="edit-isActive" className="text-sm font-normal">
                Active (accepting students)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="hero" onClick={handleEditCafeteria}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cafeteria</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedCafeteria?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast({
                  title: "Feature Coming Soon",
                  description: "Delete functionality will be implemented.",
                });
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete Cafeteria
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
