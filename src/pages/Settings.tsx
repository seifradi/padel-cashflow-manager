
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/common/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourtsSettings from "@/components/settings/CourtsSettings";
import UsersSettings from "@/components/settings/UsersSettings";
import PricingSettings from "@/components/settings/PricingSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Settings = () => {
  return (
    <Layout title="Settings">
      <PageTitle 
        title="Settings" 
        subtitle="Configure and personalize your cash register"
      />
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>About User Invitations</AlertTitle>
        <AlertDescription>
          For security reasons, inviting users requires the service role key. In a production environment, 
          this would be handled by a server-side function. For now, you can create users directly from the Supabase dashboard.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UsersSettings />
        </TabsContent>
        
        <TabsContent value="courts" className="space-y-6">
          <CourtsSettings />
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-6">
          <PricingSettings />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
