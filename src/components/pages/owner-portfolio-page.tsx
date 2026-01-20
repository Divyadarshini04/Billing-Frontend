import { useState } from "react";
import { 
  Edit, 
  Plus, 
  ArrowUpDown, 
  Upload, 
  Share2, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  MapPin,
  Trash2,
  ExternalLink,
  Calendar,
  TrendingUp,
  Copy,
  RefreshCw,
  Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import logoImage from "figma:asset/9c281fd7f40d9fc8c08d2f76f2006a1e31355018.png";

interface Reference {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  imageUrl?: string;
  order: number;
}

export function OwnerPortfolioPage() {
  const [employeeData, setEmployeeData] = useState({
    name: "John Doe",
    email: "john.doe@geobilling.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    title: "Senior Software Engineer",
    location: "San Francisco, CA",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Passionate software engineer with 8+ years of experience building scalable web applications. Specialized in React, TypeScript, and cloud infrastructure. Led multiple successful projects that improved customer satisfaction by 40%.",
    contactVisibility: "org-only",
    lastUpdated: "2025-10-28",
    referralCode: "JD8X4K2M"
  });

  const [references, setReferences] = useState<Reference[]>([
    {
      id: "1",
      title: "Customer Portal Redesign",
      description: "Led the complete redesign of the customer-facing portal, improving user engagement by 45% and reducing support tickets by 30%.",
      linkUrl: "https://example.com/project1",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      order: 0
    },
    {
      id: "2",
      title: "Real-time Analytics Dashboard",
      description: "Built a real-time analytics dashboard processing 1M+ events per day, providing actionable insights to executive team.",
      linkUrl: "https://example.com/project2",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      order: 1
    },
    {
      id: "3",
      title: "Mobile App Architecture",
      description: "Designed and implemented the mobile app architecture serving 50K+ active users with 99.9% uptime.",
      linkUrl: "https://example.com/project3",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
      order: 2
    }
  ]);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [newReference, setNewReference] = useState({
    title: "",
    description: "",
    linkUrl: ""
  });

  const handleAddReference = () => {
    if (!newReference.title || !newReference.description) {
      toast.error("Please fill in title and description");
      return;
    }

    const reference: Reference = {
      id: Date.now().toString(),
      ...newReference,
      order: references.length
    };

    setReferences([...references, reference]);
    setNewReference({ title: "", description: "", linkUrl: "" });
    toast.success("Reference added successfully!");
  };

  const handleDeleteReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
    toast.success("Reference deleted");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/p/john-doe`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Portfolio link copied to clipboard!");
  };

  const toggleVisibility = () => {
    setIsPublic(!isPublic);
    toast.success(`Portfolio is now ${!isPublic ? "public" : "private"}`);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(employeeData.referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const regenerateReferralCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setEmployeeData({ ...employeeData, referralCode: newCode });
    toast.success("New referral code generated!");
  };

  const moveReference = (fromIndex: number, toIndex: number) => {
    const newReferences = [...references];
    const [moved] = newReferences.splice(fromIndex, 1);
    newReferences.splice(toIndex, 0, moved);
    setReferences(newReferences.map((ref, index) => ({ ...ref, order: index })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Geo Billing" className="w-8 h-8 object-contain" />
              <span className="text-gray-900">Geo Billing</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-blue-200">
              <AvatarImage src={employeeData.avatarUrl} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {employeeData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={employeeData.avatarUrl} />
              <AvatarFallback className="bg-blue-800 text-white text-2xl">
                {employeeData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-white mb-2">{employeeData.name}</h1>
              <p className="text-blue-100 mb-2">{employeeData.title}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-400">
                  {employeeData.department}
                </Badge>
                <span className="flex items-center gap-1 text-blue-100">
                  <MapPin className="h-4 w-4" />
                  {employeeData.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Reference
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Reference</DialogTitle>
                    <DialogDescription>
                      Add a project, achievement, or work sample to your portfolio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ref-title">Title</Label>
                      <Input
                        id="ref-title"
                        placeholder="Project name or achievement"
                        value={newReference.title}
                        onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ref-desc">Description</Label>
                      <Textarea
                        id="ref-desc"
                        placeholder="Describe the project and your role..."
                        rows={4}
                        value={newReference.description}
                        onChange={(e) => setNewReference({ ...newReference, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ref-link">Link URL (optional)</Label>
                      <Input
                        id="ref-link"
                        type="url"
                        placeholder="https://example.com"
                        value={newReference.linkUrl}
                        onChange={(e) => setNewReference({ ...newReference, linkUrl: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddReference} className="w-full bg-green-600 hover:bg-green-700">
                      Add Reference
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setIsReorderMode(!isReorderMode)}
              >
                <ArrowUpDown className="h-4 w-4" />
                {isReorderMode ? "Done Reordering" : "Reorder References"}
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={toggleVisibility}
              >
                {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {isPublic ? "Public" : "Private"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{employeeData.bio}</p>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Contact Information
                  <Badge variant="outline">{employeeData.contactVisibility === "org-only" ? "Org Only" : "Public"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>{employeeData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-5 w-5 text-green-600" />
                  <span>{employeeData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span>{employeeData.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* References Grid */}
            <div>
              <h2 className="text-gray-900 mb-4">Portfolio References</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {references.sort((a, b) => a.order - b.order).map((reference, index) => (
                  <Card key={reference.id} className="shadow-md hover:shadow-lg transition-shadow">
                    {reference.imageUrl && (
                      <div className="h-40 overflow-hidden rounded-t-lg">
                        <img 
                          src={reference.imageUrl} 
                          alt={reference.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span className="flex-1">{reference.title}</span>
                        {isReorderMode && (
                          <div className="flex gap-1">
                            {index > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveReference(index, index - 1)}
                                className="h-6 w-6 p-0"
                              >
                                ↑
                              </Button>
                            )}
                            {index < references.length - 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveReference(index, index + 1)}
                                className="h-6 w-6 p-0"
                              >
                                ↓
                              </Button>
                            )}
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription>{reference.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {reference.linkUrl && (
                          <a 
                            href={reference.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                          >
                            View Project
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <div className="flex gap-2 ml-auto">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteReference(reference.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referral Code Card */}
            <Card className="shadow-md border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Your Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white border-2 border-blue-200 rounded-lg p-4 text-center">
                  <code className="text-2xl font-mono text-blue-600 tracking-wider">
                    {employeeData.referralCode}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferralCode}
                    className="flex-1 gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateReferralCode}
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New
                  </Button>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Share this code to track referrals and connections
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Portfolio Views</span>
                  <span className="text-gray-900">847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Referrals</span>
                  <Badge className="bg-blue-100 text-blue-700">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">References</span>
                  <span className="text-gray-900">{references.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profile Strength</span>
                  <Badge className="bg-green-100 text-green-700">92%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Last Updated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {new Date(employeeData.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="text-blue-900 mb-2">Pro Tip</h3>
                <p className="text-sm text-blue-800">
                  Keep your portfolio updated regularly to increase visibility and engagement from colleagues!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}