import { useState, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  Mail,
  User,
  Trash2,
  Image as ImageIcon,
  Save,
  X,
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { toast } from "react-hot-toast";
import BackButton from "../components/BackButton";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [previewImg, setPreviewImg] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixelsArg) => {
    if (croppedAreaPixelsArg?.width && croppedAreaPixelsArg?.height) {
      setCroppedAreaPixels(croppedAreaPixelsArg);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setPreviewImg(reader.result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    };
  };

  const handleSaveImage = async () => {
    if (!croppedAreaPixels) {
      toast.error("No area selected to crop 😢");
      return;
    }

    try {
      const croppedImg = await getCroppedImg(previewImg, croppedAreaPixels);
      const result = await updateProfile(croppedImg);

      if (result && !result.error) {
        toast.success(
          result.message || "Profile picture updated successfully! 🎉"
        );
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Crop failed:", err);
      toast.error("Image crop failed ❌");
    } finally {
      setPreviewImg(null);
      setShowMenu(false);
    }
  };

  const handleCancel = () => {
    setPreviewImg(null);
    setShowMenu(false);
  };

  const handleRemoveProfile = async () => {
    try {
      const result = await updateProfile(null);

      if (result && !result.error) {
        toast.success("Profile picture removed successfully! 🗑️");
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Remove failed:", err);
      toast.error("Failed to remove profile ❌");
    } finally {
      setShowMenu(false);
      setPreviewImg(null);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Compact inline header */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>

        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Your profile information</h2>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4 relative">
            <div className="relative group">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className={`size-32 rounded-full object-cover border-4 cursor-pointer transition-all duration-300 ${
                  showMenu ? "ring-4 ring-blue-500 scale-105" : ""
                }`}
                onClick={() => setShowMenu(true)}
              />
              <div
                className="absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => setShowMenu(true)}
              >
                <Camera className="w-5 h-5 text-base-200" />
              </div>

              {showMenu && (
                <div className="absolute top-36 left-1/2 -translate-x-1/2 w-44 bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in backdrop-blur">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setTimeout(() => {
                        document.getElementById("avatar-upload").click();
                      }, 0);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 w-full text-left cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Update Profile</span>
                  </button>
                  <button
                    onClick={handleRemoveProfile}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-500 w-full text-left cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Profile</span>
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="block w-full px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-center cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </div>
            <p className="text-sm text-zinc-400">
              Click your profile picture to update or remove it
            </p>
          </div>

          {/* Cropper */}
          {previewImg && (
            <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
              <div className="relative w-80 h-80 bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                <Cropper
                  image={previewImg}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={(val) => setZoom(Number(val))}
                  onCropComplete={onCropComplete}
                  onMediaLoaded={({ naturalWidth, naturalHeight }) => {
                    const side = Math.min(naturalWidth, naturalHeight);
                    const x = (naturalWidth - side) / 2;
                    const y = (naturalHeight - side) / 2;
                    setCroppedAreaPixels({ x, y, width: side, height: side });
                  }}
                />
              </div>

              <div className="mt-6 w-64">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-blue-500 hover:accent-blue-600 transition-all duration-300"
                />
              </div>

              <div className="flex gap-6 mt-8">
                <button
                  onClick={handleCancel}
                  className="relative px-8 py-3 rounded-full font-bold text-white
               bg-gradient-to-b from-red-600 to-red-700
               border-b-4 border-red-800 hover:border-red-900
               transform hover:translate-y-[-2px] transition-transform duration-200
               shadow-2xl hover:shadow-3xl hover:shadow-red-900/50
               active:translate-y-[2px] active:border-b-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2 drop-shadow-md">
                    <X className="w-5 h-5" />
                    Cancel
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent rounded-full" />
                </button>
                <button
                  onClick={handleSaveImage}
                  disabled={isUpdatingProfile}
                  className="relative px-8 py-3 rounded-full font-bold text-white
               bg-gradient-to-b from-emerald-600 to-emerald-700
               border-b-4 border-emerald-800 hover:border-emerald-900
               transform hover:translate-y-[-2px] transition-transform duration-200
               shadow-2xl hover:shadow-3xl hover:shadow-emerald-900/50
               active:translate-y-[2px] active:border-b-2
               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
                  <span className="flex items-center gap-2 drop-shadow-md">
                    {isUpdatingProfile ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-full" />
                </button>
              </div>
            </div>
          )}

          {/* Profile Info */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
