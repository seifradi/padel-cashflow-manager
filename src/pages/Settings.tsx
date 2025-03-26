
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/common/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourtsSettings from "@/components/settings/CourtsSettings";
import UsersSettings from "@/components/settings/UsersSettings";
import PricingSettings from "@/components/settings/PricingSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";

const Settings = () => {
  return (
    <Layout title="Settings">
      <PageTitle 
        title="Settings" 
        subtitle="Configure and personalize your cash register"
      />
      
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
