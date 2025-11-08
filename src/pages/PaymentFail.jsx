import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function PaymentFail() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <Card className="max-w-md w-full text-center border-destructive/30 shadow-lg">
        <CardHeader>
          <div className="flex justify-center">
            <XCircle className="text-destructive w-16 h-16" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-destructive">
            Payment Failed
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground mb-6">
            Oops! Something went wrong during your transaction. Please try again later or use another payment method.
          </p>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/events")}>
              Go to Events
            </Button>
            <Button onClick={() => navigate(-1)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
