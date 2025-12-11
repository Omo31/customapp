
'use client';

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from './ui/button';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface FlutterwavePaymentButtonProps {
    publicKey: string;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_options: string;
    redirect_url?: string;
    customer: {
        email: string;
        name: string;
    };
    customizations: {
        title: string;
        description: string;
        logo: string;
    };
    onSuccess: (transaction: any) => void;
}


export function FlutterwavePaymentButton(props: FlutterwavePaymentButtonProps) {
    const { onSuccess, ...config } = props;
    const [showRetryDialog, setShowRetryDialog] = useState(false);

    // IMPORTANT: The hook is called *inside* the click handler, not at the top level.
    const handleFlutterwavePayment = useFlutterwave(config);

    const initiatePayment = () => {
        handleFlutterwavePayment({
            callback: (response) => {
               onSuccess(response);
               closePaymentModal();
            },
            onClose: () => {
                setShowRetryDialog(true);
            },
        });
    };

    return (
        <>
            <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Payment Incomplete</AlertDialogTitle>
                    <AlertDialogDescription>
                        The payment process was not completed. Would you like to try again?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={initiatePayment}>Retry Payment</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button className="w-full" size="lg" onClick={initiatePayment}>
                Pay with Flutterwave
            </Button>
        </>
    );
}
