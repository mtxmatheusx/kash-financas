

## Plan: Add fallback QR Code when Evolution API fails

**Problem**: Evolution API returns errors, leaving users with no QR Code displayed.

**Solution**: Add a fallback QR generator using `api.qrserver.com` and a "demo" status indicator.

### Changes to `src/components/WhatsAppSettingsPage.tsx`

1. **Add "demo" to Status type**: `type Status = "disconnected" | "loading" | "waiting" | "demo" | "connected"`

2. **Add fallback function**:
```typescript
const generateFallbackQr = () => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`faciliten-whatsapp-${Date.now()}`)}`;
};
```

3. **Update `handleConnect`**: On any error or missing QR data from the API, fall back to the generated QR and set status to `"demo"` instead of staying `"disconnected"`.

4. **Add "Demo" badge**: Orange/yellow badge showing "QR Demo" when in demo mode.

5. **Render QR for both `"waiting"` and `"demo"` states**: The QR code grid (image + instructions) shows for either status. In demo mode, add a small info text: "Evolution API indisponível. QR Code demonstrativo."

6. **Button label**: Show "Gerar novo QR Code" for both `waiting` and `demo`.

No changes to the Edge Function -- the fallback is purely client-side.

