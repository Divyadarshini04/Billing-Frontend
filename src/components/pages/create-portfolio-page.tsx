import { useState } from "react";
import { User, Mail, Building, Briefcase, Upload, Link as LinkIcon, Plus, Eye, RefreshCw, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import logoImage from "figma:asset/9c281fd7f40d9fc8c08d2f76f2006a1e31355018.png";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner@2.0.3";

export function CreatePortfolioPage() {
  const [employeeDetails] = useState({
    name: "John Doe",
    email: "john.doe@geobilling.com",
    department: "Engineering",
    title: "Senior Software Engineer"
  });

  const [portfolioData, setPortfolioData] = useState({
    title: "",
    bio: "",
    contactVisibility: "org-only",
    avatarUrl: "",
    referralCode: ""
  });

  const generateReferralCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setPortfolioData({ ...portfolioData, referralCode: code });
    toast.success("Referral code generated!");
  };

  const [referenceItem, setReferenceItem] = useState({
    title: "",
    description: "",
    linkUrl: ""
  });

  const [avatarPreview, setAvatarPreview] = useState("");

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setPortfolioData({ ...portfolioData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePortfolio = () => {
    if (!portfolioData.title) {
      toast.error("Please enter a portfolio title");
      return;
    }
    if (!portfolioData.bio) {
      toast.error("Please enter a bio/description");
      return;
    }
    
    toast.success("Portfolio created successfully!");
    // Here you would typically save the portfolio data
    console.log("Portfolio Data:", { employeeDetails, portfolioData, referenceItem });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoImage} alt="Geo Billing" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-gray-900 mb-1">Create Your Portfolio</h1>
              <p className="text-gray-600">Showcase your work and achievements to your organization</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Section 1: Employee Details */}
            <Card className="shadow-md border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Employee Details
                </CardTitle>
                <CardDescription>Your information from the company directory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emp-name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      Full Name
                    </Label>
                    <Input
                      id="emp-name"
                      value={employeeDetails.name}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Email
                    </Label>
                    <Input
                      id="emp-email"
                      value={employeeDetails.email}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-dept" className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      Department
                    </Label>
                    <Input
                      id="emp-dept"
                      value={employeeDetails.department}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-title" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      Title
                    </Label>
                    <Input
                      id="emp-title"
                      value={employeeDetails.title}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Editable Portfolio Fields */}
            <Card className="shadow-md border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Portfolio Information
                </CardTitle>
                <CardDescription>Customize your portfolio details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-title">Portfolio Title *</Label>
                  <Input
                    id="portfolio-title"
                    placeholder="e.g., My Professional Journey at Geo Billing"
                    value={portfolioData.title}
                    onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio-bio">Bio / Description *</Label>
                  <Textarea
                    id="portfolio-bio"
                    placeholder="Tell your story... Share your expertise, achievements, and what drives you professionally."
                    rows={5}
                    value={portfolioData.bio}
                    onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">{portfolioData.bio.length} characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-visibility" className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    Contact Visibility
                  </Label>
                  <Select 
                    value={portfolioData.contactVisibility} 
                    onValueChange={(value) => setPortfolioData({ ...portfolioData, contactVisibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see</SelectItem>
                      <SelectItem value="org-only">Organization Only - Geo Billing employees</SelectItem>
                      <SelectItem value="owner-only">Owner Only - Just me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Referral Code */}
                <div className="space-y-2">
                  <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referral-code"
                      placeholder="Generate a unique code"
                      value={portfolioData.referralCode}
                      onChange={(e) => setPortfolioData({ ...portfolioData, referralCode: e.target.value.toUpperCase() })}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateReferralCode}
                      className="shrink-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Share this code to track portfolio referrals and connections
                  </p>
                </div>

                <Separator />

                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Profile Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-green-200">
                      <AvatarImage src={avatarPreview} />
                      <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                        {employeeDetails.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                          <div className="flex items-center justify-center gap-2 text-gray-600">
                            <Upload className="h-5 w-5" />
                            <span>Upload Avatar</span>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-1">
                            JPG, PNG or GIF. Max 2MB
                          </p>
                        </div>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: First Reference Item */}
            <Card className="shadow-md border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  Add Your First Reference Item
                </CardTitle>
                <CardDescription>Showcase a project, achievement, or work sample</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ref-title">Item Title</Label>
                  <Input
                    id="ref-title"
                    placeholder="e.g., Customer Portal Redesign"
                    value={referenceItem.title}
                    onChange={(e) => setReferenceItem({ ...referenceItem, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref-description">Description</Label>
                  <Textarea
                    id="ref-description"
                    placeholder="Briefly describe this work item, your role, and the impact..."
                    rows={3}
                    value={referenceItem.description}
                    onChange={(e) => setReferenceItem({ ...referenceItem, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref-link" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    Link URL
                  </Label>
                  <Input
                    id="ref-link"
                    type="url"
                    placeholder="https://example.com/project"
                    value={referenceItem.linkUrl}
                    onChange={(e) => setReferenceItem({ ...referenceItem, linkUrl: e.target.value })}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Tip:</strong> You can add more reference items after creating your portfolio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button 
              onClick={handleCreatePortfolio}
              className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-md"
              size="lg"
            >
              Create Portfolio
            </Button>
          </div>

          {/* Right Column - Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-blue-50 to-green-50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-gray-900 mb-2">Start Your Journey</h3>
                  <p className="text-gray-600">
                    Create a professional portfolio to showcase your achievements and connect with colleagues
                  </p>
                </div>
                
                <div className="rounded-xl overflow-hidden shadow-lg mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                    alt="Portfolio creation illustration"
                    className="w-full h-auto"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                    <div className="bg-green-100 rounded-full p-2">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-1">Professional Profile</h4>
                      <p className="text-sm text-gray-600">
                        Showcase your skills, experience, and achievements
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                    <div className="bg-green-100 rounded-full p-2">
                      <Briefcase className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-1">Reference Library</h4>
                      <p className="text-sm text-gray-600">
                        Build a collection of your best work and projects
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                    <div className="bg-green-100 rounded-full p-2">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-1">Control Visibility</h4>
                      <p className="text-sm text-gray-600">
                        Decide who can see your contact information
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}