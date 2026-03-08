import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Download, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "SVL-DEMO";

  const shareText = encodeURIComponent(
    "I just ordered a handcrafted leather puppet from Sindhe Vijay! Supporting 8th-generation artisans from Nimmalakunta 🎭"
  );
  const shareUrl = encodeURIComponent("https://sindhevijay.com");

  return (
    <div className="flex min-h-[70vh] items-center py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg text-center"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground md:text-4xl">Thank You!</h1>
          <p className="mt-3 text-muted-foreground">
            Your order has been placed successfully. Our artisans will begin crafting your piece with care.
          </p>

          <div className="mt-8 rounded-lg border bg-card p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm font-bold text-foreground">{orderId}</span>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              A confirmation email will be sent to your registered email address. For handcrafted
              items, please allow 3-4 weeks for preparation and shipping.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Download Receipt
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-4 w-4" /> Share
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4" /> Tweet
              </a>
            </Button>
          </div>

          <div className="mt-8">
            <Button asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYou;
