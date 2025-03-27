
import Layout from "@/components/layout/Layout";
import BookingForm from "@/components/bookings/BookingForm";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Bookings = () => {
  const { isRegisterOpen } = useData();
  
  return (
    <Layout title="Court Bookings">
      {isRegisterOpen() ? (
        <BookingForm />
      ) : (
        <div className="space-y-6 max-w-lg mx-auto text-center p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Register Closed</AlertTitle>
            <AlertDescription>
              The cash register must be opened before creating new bookings.
            </AlertDescription>
          </Alert>
          
          <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-2" />
          
          <h2 className="text-xl font-semibold">Cash Register Not Open</h2>
          <p className="text-muted-foreground">
            You need to open the cash register before creating new court bookings.
            Please go to the Cash Register page to start a new day.
          </p>
          
          <Button asChild className="mt-4">
            <Link to="/cash-register">Go to Cash Register</Link>
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Bookings;
