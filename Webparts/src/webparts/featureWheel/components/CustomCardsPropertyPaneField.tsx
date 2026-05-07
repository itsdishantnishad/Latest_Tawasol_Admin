import * as React from "react";
import * as ReactDom from "react-dom";
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
} from "@microsoft/sp-property-pane";

import {
  ICustomFeatureCardSettings,
  ICustomFeatureContentCardSettings,
} from "./FeatureWheelCardSettings";

export interface ICustomCardsPropertyPaneFieldOptions {
  key: string;
  value?: ICustomFeatureCardSettings[];
  onChanged: (cards: ICustomFeatureCardSettings[]) => void;
}

interface ICustomCardsEditorProps {
  value?: ICustomFeatureCardSettings[];
  onChanged: (cards: ICustomFeatureCardSettings[]) => void;
}

const createBlankContentCard = (): ICustomFeatureContentCardSettings => ({
  enabled: true,
  title: "",
  description: "",
  imageUrl: "",
  targetUrl: "",
});

const createBlankCard = (): ICustomFeatureCardSettings => ({
  id: "",
  enabled: true,
  title: "",
  description: "",
  imageUrl: "",
  targetUrl: "",
  header: "",
  subHeader: "",
  contentCards: [],
});

const editorStyles: { [key: string]: React.CSSProperties } = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  helpText: {
    fontSize: 12,
    lineHeight: "18px",
    color: "#605e5c",
    margin: "0 0 4px",
  },
  card: {
    border: "1px solid #edebe9",
    borderRadius: 6,
    padding: 10,
    background: "#fff",
  },
  subCard: {
    border: "1px solid #f3d6bd",
    borderRadius: 6,
    padding: 10,
    background: "#fff8f1",
    marginBottom: 10,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontWeight: 600,
    fontSize: 13,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 13,
    margin: "14px 0 8px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#323130",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 30,
    border: "1px solid #8a8886",
    borderRadius: 2,
    padding: "4px 6px",
    fontSize: 13,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 58,
    border: "1px solid #8a8886",
    borderRadius: 2,
    padding: "4px 6px",
    fontSize: 13,
    resize: "vertical",
  },
  buttonRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    minHeight: 30,
    border: "1px solid #8a8886",
    borderRadius: 2,
    background: "#fff",
    cursor: "pointer",
    padding: "4px 10px",
  },
  primaryButton: {
    minHeight: 32,
    border: "none",
    borderRadius: 2,
    background: "#0078d4",
    color: "#fff",
    cursor: "pointer",
    padding: "6px 12px",
    fontWeight: 600,
  },
  secondaryButton: {
    minHeight: 30,
    border: "1px solid #0078d4",
    borderRadius: 2,
    background: "#fff",
    color: "#0078d4",
    cursor: "pointer",
    padding: "4px 10px",
    fontWeight: 600,
  },
  dangerButton: {
    minHeight: 30,
    border: "1px solid #a4262c",
    borderRadius: 2,
    background: "#fff",
    color: "#a4262c",
    cursor: "pointer",
    padding: "4px 10px",
  },
  preview: {
    display: "block",
    width: "100%",
    maxHeight: 90,
    objectFit: "cover",
    borderRadius: 6,
    marginTop: 6,
    border: "1px solid #edebe9",
  },
  error: {
    color: "#a4262c",
    fontSize: 12,
    lineHeight: "18px",
    marginTop: 4,
  },
};

const FieldLabel: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label style={editorStyles.field}>
    <span style={editorStyles.label}>{label}</span>
    {children}
  </label>
);

const normalizeInternalIdPreview = (value: string): string =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

const CustomCardsEditor: React.FC<ICustomCardsEditorProps> = ({ value, onChanged }) => {
  const [cards, setCards] = React.useState<ICustomFeatureCardSettings[]>(() =>
    Array.isArray(value) ? value : []
  );
  const [errorByKey, setErrorByKey] = React.useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    setCards(Array.isArray(value) ? value : []);
  }, [value]);

  const commit = (nextCards: ICustomFeatureCardSettings[]): void => {
    setCards(nextCards);
    onChanged(nextCards);
  };

  const updateCard = (
    index: number,
    updates: Partial<ICustomFeatureCardSettings>
  ): void => {
    const nextCards = cards.map((card, cardIndex) =>
      cardIndex === index ? { ...card, ...updates } : card
    );
    commit(nextCards);
  };

  const updateContentCard = (
    cardIndex: number,
    contentIndex: number,
    updates: Partial<ICustomFeatureContentCardSettings>
  ): void => {
    const currentCard = cards[cardIndex] || createBlankCard();
    const currentContentCards = Array.isArray(currentCard.contentCards)
      ? currentCard.contentCards
      : [];

    const nextContentCards = currentContentCards.map((contentCard, index) =>
      index === contentIndex ? { ...contentCard, ...updates } : contentCard
    );

    updateCard(cardIndex, { contentCards: nextContentCards });
  };

  const removeCard = (index: number): void => {
    const nextCards = cards.filter((_card, cardIndex) => cardIndex !== index);
    commit(nextCards);
  };

  const addCard = (): void => {
    commit([...cards, createBlankCard()]);
  };

  const addContentCard = (cardIndex: number): void => {
    const currentCard = cards[cardIndex] || createBlankCard();
    const currentContentCards = Array.isArray(currentCard.contentCards)
      ? currentCard.contentCards
      : [];

    updateCard(cardIndex, {
      contentCards: [...currentContentCards, createBlankContentCard()],
    });
  };

  const removeContentCard = (cardIndex: number, contentIndex: number): void => {
    const currentCard = cards[cardIndex] || createBlankCard();
    const currentContentCards = Array.isArray(currentCard.contentCards)
      ? currentCard.contentCards
      : [];

    updateCard(cardIndex, {
      contentCards: currentContentCards.filter((_contentCard, index) => index !== contentIndex),
    });
  };

  const setError = (key: string, message: string): void => {
    setErrorByKey((current) => ({ ...current, [key]: message }));
  };

  const uploadImage = (
    key: string,
    file: File | undefined,
    onImageUrl: (imageUrl: string) => void
  ): void => {
    if (!file) return;

    if (!file.type.match(/^image\//i)) {
      setError(key, "Please choose an image file.");
      return;
    }

    const maxInlineImageBytes = 250 * 1024;
    if (file.size > maxInlineImageBytes) {
      setError(
        key,
        "Image is too large for inline storage. Upload it to Site Assets and paste the image URL instead."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError(key, "");
      onImageUrl(String(reader.result || ""));
    };
    reader.onerror = () => setError(key, "Could not read this image file.");
    reader.readAsDataURL(file);
  };

  return (
    <div style={editorStyles.root}>
      <p style={editorStyles.helpText}>
        Add custom wheel cards here. Use the inner content cards section when you want a Forms-like tile area below the wheel. For best performance, upload large images to Site Assets and paste the image URL. Small images under 250 KB can be uploaded directly.
      </p>

      {cards.map((card, index) => {
        const internalIdPreview = normalizeInternalIdPreview(card.id || card.title || "");
        const contentCards = Array.isArray(card.contentCards) ? card.contentCards : [];
        const cardErrorKey = `wheel-${index}`;

        return (
          <div key={index} style={editorStyles.card}>
            <div style={editorStyles.row}>
              <span style={editorStyles.title}>
                {card.title ? card.title : `Custom card ${index + 1}`}
              </span>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={card.enabled !== false}
                  onChange={(event) => updateCard(index, { enabled: event.currentTarget.checked })}
                />
                Show
              </label>
            </div>

            <FieldLabel label="Internal ID">
              <input
                style={editorStyles.input}
                value={card.id || ""}
                placeholder="Example: hr_helpdesk"
                onChange={(event) => updateCard(index, { id: event.currentTarget.value })}
              />
            </FieldLabel>
            <p style={editorStyles.helpText}>
              Keep this stable if a developer maps this card to a coded React component. Current ID: {internalIdPreview || "generated from title"}
            </p>

            <FieldLabel label="Title">
              <input
                style={editorStyles.input}
                value={card.title || ""}
                placeholder="Example: HR Helpdesk"
                onChange={(event) => updateCard(index, { title: event.currentTarget.value })}
              />
            </FieldLabel>

            <FieldLabel label="Description">
              <textarea
                style={editorStyles.textarea}
                value={card.description || card.subtitle || ""}
                placeholder="Short card description"
                onChange={(event) =>
                  updateCard(index, {
                    description: event.currentTarget.value,
                    subtitle: event.currentTarget.value,
                  })
                }
              />
            </FieldLabel>

            <FieldLabel label="Wheel image URL">
              <input
                style={editorStyles.input}
                value={card.imageUrl || ""}
                placeholder="Paste image URL, or upload a small image below"
                onChange={(event) => updateCard(index, { imageUrl: event.currentTarget.value })}
              />
            </FieldLabel>

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                uploadImage(cardErrorKey, event.currentTarget.files?.[0], (imageUrl) =>
                  updateCard(index, { imageUrl })
                )
              }
            />

            {card.imageUrl ? (
              <img src={card.imageUrl} alt="Preview" style={editorStyles.preview} />
            ) : null}

            {errorByKey[cardErrorKey] ? (
              <div style={editorStyles.error}>{errorByKey[cardErrorKey]}</div>
            ) : null}

            <FieldLabel label="Fallback target URL">
              <input
                style={editorStyles.input}
                value={card.targetUrl || ""}
                placeholder="Used only if no inner content cards are configured"
                onChange={(event) => updateCard(index, { targetUrl: event.currentTarget.value })}
              />
            </FieldLabel>

            <FieldLabel label="Content heading">
              <input
                style={editorStyles.input}
                value={card.header || ""}
                placeholder="Heading below the wheel"
                onChange={(event) => updateCard(index, { header: event.currentTarget.value })}
              />
            </FieldLabel>

            <FieldLabel label="Content subheading">
              <textarea
                style={editorStyles.textarea}
                value={card.subHeader || ""}
                placeholder="Subheading below the wheel"
                onChange={(event) => updateCard(index, { subHeader: event.currentTarget.value })}
              />
            </FieldLabel>

            <div style={editorStyles.sectionTitle}>Inner content cards</div>
            <p style={editorStyles.helpText}>
              These are the basic cards shown under this custom wheel card, similar to the Forms tiles.
            </p>

            {contentCards.map((contentCard, contentIndex) => {
              const contentErrorKey = `content-${index}-${contentIndex}`;

              return (
                <div key={contentIndex} style={editorStyles.subCard}>
                  <div style={editorStyles.row}>
                    <span style={editorStyles.title}>
                      {contentCard.title ? contentCard.title : `Inner card ${contentIndex + 1}`}
                    </span>
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={contentCard.enabled !== false}
                        onChange={(event) =>
                          updateContentCard(index, contentIndex, {
                            enabled: event.currentTarget.checked,
                          })
                        }
                      />
                      Show
                    </label>
                  </div>

                  <FieldLabel label="Inner card title">
                    <input
                      style={editorStyles.input}
                      value={contentCard.title || ""}
                      placeholder="Example: Human Capital"
                      onChange={(event) =>
                        updateContentCard(index, contentIndex, { title: event.currentTarget.value })
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Inner card description">
                    <textarea
                      style={editorStyles.textarea}
                      value={contentCard.description || ""}
                      placeholder="Optional short description"
                      onChange={(event) =>
                        updateContentCard(index, contentIndex, {
                          description: event.currentTarget.value,
                        })
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Inner card image URL">
                    <input
                      style={editorStyles.input}
                      value={contentCard.imageUrl || ""}
                      placeholder="Paste image URL, or upload a small image below"
                      onChange={(event) =>
                        updateContentCard(index, contentIndex, {
                          imageUrl: event.currentTarget.value,
                        })
                      }
                    />
                  </FieldLabel>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      uploadImage(contentErrorKey, event.currentTarget.files?.[0], (imageUrl) =>
                        updateContentCard(index, contentIndex, { imageUrl })
                      )
                    }
                  />

                  {contentCard.imageUrl ? (
                    <img src={contentCard.imageUrl} alt="Preview" style={editorStyles.preview} />
                  ) : null}

                  {errorByKey[contentErrorKey] ? (
                    <div style={editorStyles.error}>{errorByKey[contentErrorKey]}</div>
                  ) : null}

                  <FieldLabel label="Inner card target URL">
                    <input
                      style={editorStyles.input}
                      value={contentCard.targetUrl || ""}
                      placeholder="URL opened when this inner card is clicked"
                      onChange={(event) =>
                        updateContentCard(index, contentIndex, {
                          targetUrl: event.currentTarget.value,
                        })
                      }
                    />
                  </FieldLabel>

                  <div style={editorStyles.buttonRow}>
                    <button
                      type="button"
                      style={editorStyles.dangerButton}
                      onClick={() => removeContentCard(index, contentIndex)}
                    >
                      Remove inner card
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={editorStyles.buttonRow}>
              <button
                type="button"
                style={editorStyles.secondaryButton}
                onClick={() => addContentCard(index)}
              >
                Add inner content card
              </button>
              <button
                type="button"
                style={editorStyles.dangerButton}
                onClick={() => removeCard(index)}
              >
                Remove wheel card
              </button>
            </div>
          </div>
        );
      })}

      <button type="button" style={editorStyles.primaryButton} onClick={addCard}>
        Add custom wheel card
      </button>
    </div>
  );
};

export const createCustomCardsPropertyPaneField = (
  options: ICustomCardsPropertyPaneFieldOptions
): IPropertyPaneField<any> => {
  return {
    type: PropertyPaneFieldType.Custom,
    targetProperty: options.key,
    properties: {
      key: options.key,
      onRender: (domElement: HTMLElement): void => {
        ReactDom.render(
          <CustomCardsEditor value={options.value} onChanged={options.onChanged} />,
          domElement
        );
      },
      onDispose: (domElement: HTMLElement): void => {
        ReactDom.unmountComponentAtNode(domElement);
      },
    },
  } as IPropertyPaneField<any>;
};
