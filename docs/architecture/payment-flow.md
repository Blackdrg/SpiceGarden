# Payment Flow

```mermaid
flowchart TD
    subgraph Payment Flow
        Start([Create Payment Intent]) --> Validate{Validate Amount}
        Validate -->|Invalid| Reject[400 Bad Request]
        Validate -->|Valid| AbuseCheck{Abuse Prevention}
        
        AbuseCheck --> CheckDaily{Daily Limit OK?}
        CheckDaily -->|Exceeded| RejectDaily[Reject - Limit Exceeded]
        CheckDaily -->|OK| CheckSuspicious{Suspicious Pattern?}
        
        CheckSuspicious -->|Suspicious| Flag[Flag for Review<br/>Proceed with Caution]
        CheckSuspicious -->|Clean| Proceed[Proceed]
        Flag --> Proceed
        RejectDaily --> End[End]
        
        Proceed --> GatewaySelect{Select Gateway}
        GatewaySelect -->|Stripe| StripeGateway[Stripe Gateway]
        GatewaySelect -->|Razorpay| RazorpayGateway[Razorpay Gateway]
        GatewaySelect -->|COD| CODGateway[COD Gateway]
        
        StripeGateway --> StripeAPI[Stripe API]
        RazorpayGateway --> RazorpayAPI[Razorpay API]
        CODGateway --> CODProcess[Cash on Delivery]
        
        StripeAPI --> WebhookCheck{Webhook?}
        RazorpayAPI --> WebhookCheck
        CODProcess --> WebhookCheck
        
        WebhookCheck -->|Yes| WebhookHandler[Webhook Handler<br/>Verify Signature]
        WebhookCheck -->|No| IntentCreated[Return Intent ID]
        
        WebhookHandler --> IdempotencyIdempotency Check
        IntentCreated --> Store[Store Payment Intent]
        Idempotency --> Store
        
        Store --> AuditLog[Log to Audit Service]
        AuditLog --> Response[Return Payment Intent]
    end
    
    subgraph Confirmation Flow
        PaymentConfirmed([Confirm Payment]) --> Retrieve[Retrieve Payment]
        Retrieve --> UpdateOrder[Update Order<br/>Status: Payment Confirmed]
        UpdateOrder --> Ledger[Create Ledger Entry]
        Ledger --> Notify[Send Notification]
        Notify --> Return[Return Success]
    end
    
    subgraph Refund Flow
        RefundRequest([Refund Request]) --> ValidateRefund{Validate Refund}
        ValidateRefund -->|Invalid| RefundReject[Reject Refund]
        ValidateRefund -->|Valid| ProcessRefund[Process Refund<br/>Gateway]
        ProcessRefund --> LedgerReverse[Ledger Entry<br/>Reverse]
        LedgerReverse --> NotifyRefund[Notify Customer<br/>Refund Initiated]
        NotifyRefund --> ReturnRefund[Return Refund Result]
    end
    
    Response --> End
    Return --> End
    ReturnRefund --> End
```