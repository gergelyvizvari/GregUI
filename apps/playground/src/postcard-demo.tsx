import { useState } from 'react';
import {
  Alert,
  AddressFields,
  Button,
  Status,
  Select,
  type AddressValue,
  DocumentPreview,
  MailFace,
  Postmark,
  useFormat,
  DocumentSpread,
  type DocumentPreviewPage,
  TextField,
  Field,
  FormSection,
  Grid,
  Heading,
  Stack,
  Text,
  Textarea,
  VisualChoiceGroup,
} from '@gregui/react';
import { samplePhoto, PhotoCredit } from './sample-media';

import {
  initialPostcardAddress,
  postcardCountries,
  postcardAddressFields,
  postcardAddressLines,
  validatePostcardAddress,
  type PostcardCountry,
} from './postcard-address';

export function PostcardDemo() {
  const [format, setFormat] = useState<'flat' | 'folded'>('flat');
  const [flatMailingMethod, setFlatMailingMethod] = useState<'direct' | 'envelope'>('direct');
  const usesEnvelope = format === 'folded' || flatMailingMethod === 'envelope';
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const cardWidth = orientation === 'portrait' ? 105 : 148;
  const cardHeight = orientation === 'portrait' ? 148 : 105;
  const [insideLeft, setInsideLeft] = useState('');
  const [backText, setBackText] = useState('A little note, just for you.');
  const [design, setDesign] = useState<string | null>('alpine');
  const { date: formatDate } = useFormat();
  const [pageId, setPageId] = useState('front');
  const [message, setMessage] = useState(
    'Wish you were here! A little mountain air and a lot of happy memories.\n\nLove, Alex',
  );
  const [postcardAddress, setPostcardAddress] = useState<AddressValue>(initialPostcardAddress);
  const [envelopeAddress, setEnvelopeAddress] = useState<AddressValue>(initialPostcardAddress);
  const address = usesEnvelope ? envelopeAddress : postcardAddress;
  const setAddress = usesEnvelope ? setEnvelopeAddress : setPostcardAddress;
  const [senderAddress, setSenderAddress] = useState<AddressValue>({
    recipient: 'Nagy Alex',
    addressLine1: 'Példa utca 5.',
    addressLine2: '',
    locality: 'Szeged',
    region: '',
    postalCode: '6720',
    countryCode: 'HU',
  });
  const postingFrom = senderAddress.countryCode as PostcardCountry;
  const [senderReviewed, setSenderReviewed] = useState(false);
  const senderFields = postcardAddressFields(postingFrom, 'sender').filter(
    (field) => field.key !== 'countryCode',
  );
  const senderErrors = senderReviewed ? validatePostcardAddress(senderAddress, 'sender') : {};
  const [reviewedMethods, setReviewedMethods] = useState({ direct: false, envelope: false });
  const mailingMethod = usesEnvelope ? 'envelope' : 'direct';
  const reviewed = reviewedMethods[mailingMethod];
  const fields = postcardAddressFields(address.countryCode);
  const errors = reviewed ? validatePostcardAddress(address) : {};
  const greeting = (
    <Stack>
      <Heading level={3} size="section">
        A little hello
      </Heading>
      <Text>Thinking of you, wherever you are.</Text>
    </Stack>
  );
  const artwork =
    design === 'alpine' ? <img src={samplePhoto.src} alt={samplePhoto.alt} /> : greeting;
  const messageContent = (text: string) => (
    <Text>
      {text.split('\n').map((line, index) => (
        <span key={index}>
          {line}
          <br />
        </span>
      ))}
    </Text>
  );
  const addressContent = (value: AddressValue, referenceCountry: PostcardCountry = postingFrom) => (
    <Stack gap={0}>
      <Text>{value.recipient}</Text>
      <Text>
        {postcardAddressLines(value, referenceCountry).map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </Text>
    </Stack>
  );
  const pages: DocumentPreviewPage[] =
    format === 'flat'
      ? [
          {
            id: 'front',
            label: 'Front',
            padding: design === 'alpine' ? 'none' : 'standard',
            content: artwork,
          },
          {
            id: 'back',
            label: 'Back',
            padding: usesEnvelope ? 'standard' : 'none',
            content: usesEnvelope ? (
              messageContent(message)
            ) : (
              <MailFace
                label="Postcard mailing face"
                variant="postcard"
                postageLabel="Postage"
                sender={{
                  label: 'Postcard sender',
                  content: addressContent(
                    senderAddress,
                    postcardAddress.countryCode as PostcardCountry,
                  ),
                }}
                message={{ label: 'Postcard message', content: messageContent(message) }}
                recipient={{
                  label: 'Postcard recipient',
                  content: addressContent(postcardAddress),
                }}
                postmark={
                  <Postmark
                    place={senderAddress.locality || 'Greetings'}
                    date={formatDate(new Date(), { day: 'numeric', month: 'short' })}
                    detail={formatDate(new Date(), { year: 'numeric' })}
                  />
                }
              />
            ),
          },
        ]
      : [
          {
            id: 'cover',
            label: 'Cover',
            padding: design === 'alpine' ? 'none' : 'standard',
            content: artwork,
          },
          {
            id: 'inside',
            label: 'Inside (open spread)',
            padding: 'none',
            content: (
              <DocumentSpread
                label="Open card inside"
                showFold
                panels={[
                  { label: 'Inside left', content: messageContent(insideLeft) },
                  { label: 'Inside right', content: messageContent(message) },
                ]}
              />
            ),
          },
          { id: 'back', label: 'Back cover', content: messageContent(backText) },
        ];
  return (
    <Stack>
      <Text>
        Choose a flat card or a folded card in landscape or portrait. Flat cards can be mailed
        directly or placed in an envelope. Closed cards are {cardWidth} × {cardHeight} mm; the
        folded inside opens to {cardWidth * 2} × {cardHeight} mm. All details stay in this local
        demo.
      </Text>
      <Field label="Card format">
        {(field) => (
          <Select
            {...field}
            value={format}
            onChange={(event) => {
              const next = event.target.value as 'flat' | 'folded';
              setFormat(next);
              setPageId(next === 'flat' ? 'front' : 'cover');
            }}
          >
            <option value="flat">Flat card</option>
            <option value="folded">Folded card</option>
          </Select>
        )}
      </Field>
      <Field
        label="Mailing method"
        hint={
          format === 'folded'
            ? 'Folded cards are sent in an envelope.'
            : 'The recipient address appears only on the outside of the item being mailed.'
        }
      >
        {(field) => (
          <Select
            {...field}
            value={mailingMethod}
            onChange={(event) => setFlatMailingMethod(event.target.value as 'direct' | 'envelope')}
          >
            <option value="direct" disabled={format === 'folded'}>
              Direct mail — address on postcard
            </option>
            <option value="envelope">In an envelope — address on envelope</option>
          </Select>
        )}
      </Field>
      <Field label="Card orientation">
        {(field) => (
          <Select
            {...field}
            value={orientation}
            onChange={(event) => setOrientation(event.target.value as 'landscape' | 'portrait')}
          >
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
          </Select>
        )}
      </Field>
      <VisualChoiceGroup
        label="Postcard design"
        value={design}
        onChange={setDesign}
        hint="Choose one design. Use the arrow keys to move between available choices."
        options={[
          {
            value: 'alpine',
            label: 'Alpine escape',
            description: 'Full-image photography',
            preview: <img src={samplePhoto.src} alt="" />,
          },
          {
            value: 'hello',
            label: 'A little hello',
            description: 'A simple typographic greeting',
            preview: <Text>A little hello</Text>,
          },
          {
            value: 'generated',
            label: 'AI artwork',
            preview: <Text>Your idea, illustrated</Text>,
            disabled: true,
            status: 'Unavailable in this demo',
          },
        ]}
      />
      <Grid columns={2}>
        <FormSection
          title={
            format === 'flat'
              ? usesEnvelope
                ? 'Personalise your flat card'
                : 'Personalise your postcard'
              : 'Personalise your folded card'
          }
        >
          <Stack>
            {format === 'folded' && (
              <Field label="Inside left message (optional)">
                {(field) => (
                  <Textarea
                    {...field}
                    value={insideLeft}
                    onChange={(event) => setInsideLeft(event.target.value)}
                    rows={3}
                  />
                )}
              </Field>
            )}
            <Field
              label="Message"
              hint={format === 'folded' ? 'Shown on the inside right panel.' : undefined}
            >
              {(field) => (
                <Textarea
                  {...field}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                />
              )}
            </Field>
            {format === 'folded' && (
              <TextField
                label="Back cover text"
                value={backText}
                onChange={(event) => setBackText(event.target.value)}
              />
            )}
            <Field
              label="Posting from"
              hint="Domestic addresses omit the country line; cross-border addresses include it."
            >
              {(field) => (
                <Select
                  {...field}
                  value={postingFrom}
                  onChange={(event) =>
                    setSenderAddress((current) => ({ ...current, countryCode: event.target.value }))
                  }
                >
                  {postcardCountries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <AddressFields
              label="Sender / return address"
              hint="Uses the country selected in Posting from. Use fictional details in this example."
              value={senderAddress}
              onChange={setSenderAddress}
              fields={senderFields}
              countries={postcardCountries}
              errors={senderErrors}
              namePrefix="sender"
            />
            <AddressFields
              label={usesEnvelope ? 'Envelope address' : 'Recipient address'}
              hint="Use fictional details in this example."
              value={address}
              onChange={setAddress}
              fields={fields}
              countries={postcardCountries}
              errors={errors}
              namePrefix={usesEnvelope ? 'envelope' : 'recipient'}
              autoComplete="shipping"
            />
            <Button
              type="button"
              onClick={() => {
                setSenderReviewed(true);
                setReviewedMethods((current) => ({ ...current, [mailingMethod]: true }));
              }}
            >
              Check address fields
            </Button>
            <Status>
              {reviewed
                ? Object.keys(errors).length === 0 && Object.keys(senderErrors).length === 0
                  ? 'Address fields and postcode format checked.'
                  : 'Check the highlighted address fields.'
                : ''}
            </Status>
          </Stack>
        </FormSection>
        <Stack>
          <DocumentPreview
            label={format === 'flat' ? 'Postcard preview' : 'Folded card preview'}
            widthMm={format === 'folded' && pageId === 'inside' ? cardWidth * 2 : cardWidth}
            heightMm={cardHeight}
            safeAreaMm={5}
            pageId={pageId}
            onPageChange={setPageId}
            labels={{ page: 'Side', zoom: 'Zoom', fit: 'Fit to view', guides: 'Show safe area' }}
            pages={pages}
          />
          {usesEnvelope && (
            <DocumentPreview
              label="Envelope preview"
              widthMm={162}
              heightMm={114}
              safeAreaMm={5}
              pageId="address"
              onPageChange={() => {}}
              labels={{ page: 'Face', zoom: 'Zoom', fit: 'Fit to view', guides: 'Show safe area' }}
              pages={[
                {
                  id: 'address',
                  label: 'Envelope front',
                  padding: 'none',
                  content: (
                    <MailFace
                      label="Envelope face"
                      variant="envelope"
                      postageLabel="Postage"
                      sender={{
                        label: 'Envelope sender',
                        content: addressContent(
                          senderAddress,
                          envelopeAddress.countryCode as PostcardCountry,
                        ),
                      }}
                      recipient={{
                        label: 'Envelope recipient',
                        content: addressContent(envelopeAddress),
                      }}
                    />
                  ),
                },
              ]}
            />
          )}
          <Alert title="Screen preview only">
            Review text fit on each panel. Fold and safe-area guides are illustrative; the envelope
            is a 162 × 114 mm example. Print/PDF export, duplex layout, bleed, image-resolution
            checks and AI generation are future application features.
          </Alert>
        </Stack>
      </Grid>
      <PhotoCredit />
    </Stack>
  );
}
