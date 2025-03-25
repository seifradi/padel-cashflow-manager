
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/common/PageTitle";
import Card from "@/components/common/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <Card title="General Settings">
            <div className="text-muted-foreground">
              General settings will be implemented here
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <Card title="User Management">
            <div className="text-muted-foreground">
              User management will be implemented here
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="courts" className="space-y-6">
          <Card title="Court Management">
            <div className="text-muted-foreground">
              Court management will be implemented here
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-6">
          <Card title="Pricing Settings">
            <div className="text-muted-foreground">
              Pricing settings will be implemented here
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
