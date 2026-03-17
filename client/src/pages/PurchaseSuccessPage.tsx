import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PurchaseSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <CheckCircle className="mx-auto h-20 w-20 text-success" />
        <h1 className="mt-6 font-display text-3xl font-bold">Purchase Successful!</h1>
        <p className="mt-2 text-muted-foreground">Your games have been added to your library.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => navigate("/library")}>View Library</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
