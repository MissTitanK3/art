"use client";

import React from "react";
import { toast } from "sonner";
import {
  ProfileForm,
  type ProfileFormProps,
} from "@workspace/ui/components/client/profile/ProfileForm";
import { Profile } from "@workspace/store/types/global.ts";

export type ProfileLayoutProps = {
  profile: Profile;
  initial: ProfileFormProps["initial"];
  ImageComponent: ProfileFormProps["ImageComponent"];
  imageUrl?: ProfileFormProps["ImageUrl"];
  onSubmit: (
    values: ProfileFormProps["initial"],
  ) => Promise<{ ok: boolean; err?: string }>;
  onDeleteProfile: (id: string | undefined) => Promise<void>;
};

export function ProfileLayout({
  profile,
  initial,
  ImageComponent,
  imageUrl,
  onSubmit,
  onDeleteProfile,
}: ProfileLayoutProps) {
  const handleSubmit: ProfileFormProps["onSubmit"] = async (values) => {
    try {
      return await onSubmit(values);
    } catch (error: any) {
      toast.error("Failed to save profile");
      return { ok: false, err: error?.message ?? "Unknown error" };
    }
  };

  const handleDelete: ProfileFormProps["onDelete"] = async () => {
    try {
      await onDeleteProfile(profile.id);
      return { ok: true };
    } catch (error: any) {
      toast.error("Failed to delete profile");
      return { ok: false, err: error?.message ?? "Unknown error" };
    }
  };

  return (
    <ProfileForm
      initial={initial}
      ImageComponent={ImageComponent}
      ImageUrl={imageUrl}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}

export default ProfileLayout;
