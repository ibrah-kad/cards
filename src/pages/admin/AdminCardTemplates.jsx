import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  QrCode,
  FileText,
  User,
  Sparkles,
} from "lucide-react";
import { AdminAPI, assetUrl } from "../../api/api";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { playPopSound, playClickSound } from "../../utils/audio";
const PREDEFINED_FIELDS = [
  {
    name: "coupleNames",
    label: "Couple's Names",
    defaultSize: 32,
  },
  {
    name: "brideName",
    label: "Bride's Name",
    defaultSize: 28,
  },
  {
    name: "groomName",
    label: "Groom's Name",
    defaultSize: 28,
  },
  {
    name: "eventDate",
    label: "Event Date",
    defaultSize: 24,
  },
  {
    name: "eventTime",
    label: "Event Time",
    defaultSize: 20,
  },
  {
    name: "venue",
    label: "Venue",
    defaultSize: 22,
  },
  {
    name: "celebrantName",
    label: "Celebrant Name",
    defaultSize: 20,
  },
  {
    name: "host",
    label: "Host Name",
    defaultSize: 20,
  },
  {
    name: "rsvp",
    label: "RSVP Contact",
    defaultSize: 18,
  },
];
const DEFAULT_FIELD_CONFIG = {
  positionX: 50,
  positionY: 50,
  width: 60,
  fontSize: 24,
  fontFamily: "Playfair Display",
  fontColor: "#26201A",
  textAlign: "center",
  required: false,
  imageWidth: 120,
  imageHeight: 120,
};
const FONT_FAMILIES = [
  {
    name: "Playfair Display",
    label: "Playfair Display (Elegant Serif)",
  },
  {
    name: "Great Vibes",
    label: "Great Vibes (Calligraphy Script)",
  },
  {
    name: "Dancing Script",
    label: "Dancing Script (Playful Script)",
  },
  {
    name: "Montserrat",
    label: "Montserrat (Modern Sans)",
  },
  {
    name: "Plus Jakarta Sans",
    label: "Plus Jakarta Sans (Clean Modern)",
  },
  {
    name: "Lato",
    label: "Lato (Minimal Sans)",
  },
  {
    name: "Roboto",
    label: "Roboto (Neutral)",
  },
  {
    name: "Merriweather",
    label: "Merriweather (Classic Serif)",
  },
  {
    name: "Pacifico",
    label: "Pacifico (Fun Display)",
  },
  {
    name: "Lobster",
    label: "Lobster (Retro Bold)",
  },
];
export default function AdminCardTemplates() {
  const [items, setItems] = useState(null);
  const [events, setEvents] = useState([]);
  const [paragraphs, setParagraphs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });
  const canvasRef = useRef(null);
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    eventTypeId: "1",
    previewImageUrl: "",
  });
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const load = () => {
    AdminAPI.listCardTemplates()
      .then(setItems)
      .catch((e) => toast.error(e.message));
    AdminAPI.listEvents()
      .then(setEvents)
      .catch(() => {});
    AdminAPI.listParagraphTemplates()
      .then(setParagraphs)
      .catch(() => setParagraphs([]));
  };
  useEffect(load, []);
  const openNew = () => {
    setForm({
      name: "",
      eventTypeId: events[0] ? String(events[0].id) : "1",
      previewImageUrl: "",
    });
    setFields([
      {
        id: 1,
        fieldName: "coupleNames",
        fieldLabel: "Couple Names",
        fieldType: "TEXT",
        positionX: 50,
        positionY: 34,
        fontSize: 32,
        fontFamily: "Playfair Display",
        fontColor: "#A8570D",
        textAlign: "center",
        width: 70,
        required: true,
      },
      {
        id: 2,
        fieldName: "eventDate",
        fieldLabel: "Event Date",
        fieldType: "TEXT",
        positionX: 50,
        positionY: 48,
        fontSize: 20,
        fontFamily: "Montserrat",
        fontColor: "#26201A",
        textAlign: "center",
        width: 60,
        required: true,
      },
      {
        id: 3,
        fieldName: "guestQr",
        fieldLabel: "Gate QR Pass",
        fieldType: "QR_CODE",
        positionX: 50,
        positionY: 82,
        imageWidth: 100,
        imageHeight: 100,
      },
    ]);
    setSelectedField(null);
    setEditing({
      id: 0,
      name: "",
      active: true,
    });
  };
  const handleEdit = (t) => {
    setForm({
      name: t.name,
      eventTypeId: String(t.eventTypeId || t.eventType?.id || "1"),
      previewImageUrl: t.previewImageUrl || "",
    });
    const sanitizedFields = (t.fields || []).map((f) => ({
      ...f,
      fieldType: [
        "TEXT",
        "QR_CODE",
        "IMAGE",
        "PARAGRAPH",
        "INVITEE_NAME",
      ].includes(f.fieldType)
        ? f.fieldType
        : "TEXT",
    }));
    setFields(
      sanitizedFields.length > 0
        ? sanitizedFields
        : [
            {
              id: 1,
              fieldName: "coupleNames",
              fieldLabel: "Celebrant Names",
              fieldType: "TEXT",
              positionX: 50,
              positionY: 35,
              fontSize: 30,
              fontFamily: "Playfair Display",
              fontColor: "#A8570D",
              textAlign: "center",
              width: 70,
            },
          ],
    );
    setSelectedField(null);
    setEditing(t);
  };
  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const res = await AdminAPI.uploadFile(file);
      setForm((f) => ({
        ...f,
        previewImageUrl: res.url,
      }));
      playPopSound(540);
      toast.success("Background image uploaded successfully!");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };
  const addField = (fieldNameOrType, specialType = null, extra = {}) => {
    playPopSound(500);
    const predefined = PREDEFINED_FIELDS.find(
      (f) => f.name === fieldNameOrType,
    );
    const validTypes = [
      "TEXT",
      "QR_CODE",
      "IMAGE",
      "PARAGRAPH",
      "INVITEE_NAME",
    ];
    const actualFieldType =
      specialType && validTypes.includes(specialType) ? specialType : "TEXT";
    const newField = {
      id: Date.now(),
      fieldName: fieldNameOrType || specialType?.toLowerCase() || "customField",
      fieldLabel:
        predefined?.label ||
        (specialType === "QR_CODE"
          ? "Gate Entry QR"
          : specialType === "IMAGE"
            ? "Couple Photo"
            : specialType === "INVITEE_NAME"
              ? "Invitee Name"
              : fieldNameOrType || "Custom Text"),
      ...DEFAULT_FIELD_CONFIG,
      fontSize: predefined?.defaultSize || 24,
      displayOrder: fields.length,
      fieldType: actualFieldType,
      positionX: 50,
      positionY: Math.min(85, 25 + fields.length * 10),
      ...extra,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };
  const addCustomField = () => {
    if (!customFieldName.trim() || !customFieldLabel.trim()) {
      return toast.error("Please provide both field name and display label");
    }
    if (!/^[a-z][a-zA-Z0-9]*$/.test(customFieldName.trim())) {
      return toast.error(
        "Field name must be camelCase (e.g., fatherName, tableNumber)",
      );
    }
    addField(customFieldName.trim(), "TEXT", {
      fieldLabel: customFieldLabel.trim(),
    });
    setCustomFieldName("");
    setCustomFieldLabel("");
  };
  const updateField = (id, updates) => {
    if (!id) return;
    setFields(
      fields.map((f) =>
        f.id === id
          ? {
              ...f,
              ...updates,
            }
          : f,
      ),
    );
    if (selectedField?.id === id) {
      setSelectedField((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : null,
      );
    }
  };
  const removeField = (id) => {
    playClickSound();
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField?.id === id) setSelectedField(null);
  };

  // Pointer / Drag interactions (mouse & touch responsive)
  const handlePointerDown = (e, field) => {
    e.stopPropagation();
    if (!canvasRef.current || !field.id) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragging(field.id);
    setDragOffset({
      x: x - field.positionX,
      y: y - field.positionY,
    });
    setSelectedField(field);
    playClickSound();
  };
  const handlePointerMove = (e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newX = Math.round(Math.max(5, Math.min(95, x - dragOffset.x)));
    const newY = Math.round(Math.max(5, Math.min(95, y - dragOffset.y)));
    updateField(dragging, {
      positionX: newX,
      positionY: newY,
    });
  };
  const handlePointerUp = () => {
    setDragging(null);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.eventTypeId) {
      return toast.error("Template name and occasion are required");
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        eventTypeId: Number(form.eventTypeId),
        eventType: {
          id: Number(form.eventTypeId),
          name:
            events.find((ev) => ev.id === Number(form.eventTypeId))?.name ||
            "Occasion",
        },
        previewImageUrl: form.previewImageUrl,
        active: true,
        fields: fields.map((f, idx) => ({
          ...f,
          displayOrder: idx,
          id: typeof f.id === "number" && f.id > 1000000000000 ? null : f.id,
        })),
      };
      if (editing?.id && editing.id !== 0) {
        await AdminAPI.updateCardTemplate(editing.id, payload);
      } else {
        await AdminAPI.createCardTemplate(payload);
      }
      playPopSound(580);
      toast.success("Card template layout saved successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error("Error saving card template: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const eventName = (t) =>
    events.find((e) => e.id === (t.eventTypeId ?? t.eventType?.id))?.name ||
    "General";
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            Visual Customizer
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Card Designs &amp; Layouts
          </h1>
          <p className="text-xs text-ink/50 mt-1">
            Build bespoke card layouts with interactive drag-and-drop element
            positioning.
          </p>
        </div>
        <button
          onClick={openNew}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Card Design
        </button>
      </div>

      {!items && <Loader label="Loading card templates…" full />}

      {/* Templates Grid */}
      {items && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <InteractiveCard3D
              key={t.id}
              tiltIntensity={7}
              className="overflow-hidden flex flex-col justify-between"
            >
              <div className="h-52 bg-gradient-to-br from-sand-100 to-blush/20 relative overflow-hidden group">
                {t.previewImageUrl ? (
                  <img
                    src={assetUrl(t.previewImageUrl)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={t.name}
                    onError={(ev) => (ev.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-ink/35 text-xs font-bold">
                    <FileText size={32} className="mb-1" />
                    <span>Card Canvas</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 shadow-sm text-ink/75">
                  {t.fields?.length || 0} fields positioned
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-ink mb-0.5">
                  {t.name}
                </h3>
                <p className="text-xs text-marigold-700 font-bold mb-4">
                  {eventName(t)}
                </p>

                <div className="flex gap-2 pt-3 border-t border-ink/8">
                  <button
                    onClick={() => handleEdit(t)}
                    className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
                  >
                    <Pencil size={13} /> Edit Layout
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete template "${t.name}"?`)) return;
                      await AdminAPI.deleteCardTemplate(t.id);
                      toast.success("Template deleted.");
                      load();
                    }}
                    className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </InteractiveCard3D>
          ))}
        </div>
      )}

      {/* Full-Featured Drag-and-Drop Card Layout Designer Modal */}
      {editing !== null && (
        <Modal
          title={
            editing.id
              ? `Edit Layout: ${editing.name || "Template"}`
              : "Create New Card Design"
          }
          onClose={() => setEditing(null)}
          size="2xl"
        >
          <div className="grid lg:grid-cols-12 gap-6">
            {/* ========================================================
                LEFT COLUMN (5 cols): CONTROLS & FIELD INVENTORIES
                ======================================================== */}
            <div className="lg:col-span-5 space-y-4">
              {/* Template Basic Info */}
              <div className="bg-sand-100/90 p-4 rounded-2xl border border-white space-y-3">
                <div>
                  <label className="text-xs font-bold text-ink/75 block mb-1 uppercase tracking-wider">
                    Design Name *
                  </label>
                  <input
                    className="clay-input !py-1.5 text-xs font-semibold"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Golden Royale Velvet"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink/75 block mb-1 uppercase tracking-wider">
                    Assigned Occasion *
                  </label>
                  <select
                    className="clay-input !py-1.5 text-xs font-semibold"
                    value={form.eventTypeId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        eventTypeId: e.target.value,
                      })
                    }
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink/75 block mb-1 uppercase tracking-wider">
                    Card Background Image
                  </label>
                  <label className="clay-btn-secondary !w-full !py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
                    {uploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ImagePlus size={14} />
                    )}
                    <span>
                      {uploading ? "Uploading..." : "Upload Background File"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && handleUpload(e.target.files[0])
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Predefined Fields Palette */}
              <div className="bg-sand-100/90 p-4 rounded-2xl border border-white">
                <span className="text-xs font-bold text-ink/70 block mb-2 uppercase tracking-wider">
                  Quick Add Text Fields
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PREDEFINED_FIELDS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => addField(f.name)}
                      className="clay-btn-secondary !py-1.5 !px-2 text-[11px] font-bold text-left justify-start"
                    >
                      <Plus size={11} className="shrink-0 text-marigold" />
                      <span className="truncate">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Field Types (QR, Image, Invitee) */}
              <div className="bg-sand-100/90 p-4 rounded-2xl border border-white">
                <span className="text-xs font-bold text-ink/70 block mb-2 uppercase tracking-wider">
                  Special Components
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => addField("guestQr", "QR_CODE")}
                    className="clay-btn-secondary !py-2 !px-1.5 text-[10px] font-bold flex flex-col items-center gap-1 text-center"
                  >
                    <QrCode size={14} className="text-blue-600" />
                    <span>QR Gate Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addField("couplePhoto", "IMAGE")}
                    className="clay-btn-secondary !py-2 !px-1.5 text-[10px] font-bold flex flex-col items-center gap-1 text-center"
                  >
                    <ImagePlus size={14} className="text-purple-600" />
                    <span>Couple Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addField("guestName", "INVITEE_NAME")}
                    className="clay-btn-secondary !py-2 !px-1.5 text-[10px] font-bold flex flex-col items-center gap-1 text-center"
                  >
                    <User size={14} className="text-emerald-600" />
                    <span>Invitee Name</span>
                  </button>
                </div>
              </div>

              {/* Custom Field Adder */}
              <div className="bg-sand-100/90 p-4 rounded-2xl border border-white">
                <span className="text-xs font-bold text-ink/70 block mb-2 uppercase tracking-wider">
                  Custom Variable Field
                </span>
                <div className="flex gap-2 mb-2">
                  <input
                    className="clay-input !py-1 text-xs font-mono flex-1"
                    placeholder="camelCase (tableNumber)"
                    value={customFieldName}
                    onChange={(e) => setCustomFieldName(e.target.value)}
                  />
                  <input
                    className="clay-input !py-1 text-xs flex-1"
                    placeholder="Label (Table #)"
                    value={customFieldLabel}
                    onChange={(e) => setCustomFieldLabel(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="clay-btn-secondary !w-full !py-1.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} /> Add Custom Field
                </button>
              </div>

              {/* Active Fields Inventory List */}
              <div className="bg-sand-100/90 p-4 rounded-2xl border border-white max-h-52 overflow-y-auto pr-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-ink/70 uppercase tracking-wider">
                    Positioned Elements ({fields.length})
                  </span>
                  <span className="text-[10px] text-ink/40">
                    Tap to style or drag on card
                  </span>
                </div>
                <div className="space-y-1.5">
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        playClickSound();
                        setSelectedField(f);
                      }}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer border transition-all ${selectedField?.id === f.id ? "bg-marigold-50 border-marigold text-marigold-900 font-bold shadow-sm" : "bg-white/80 border-ink/5 hover:bg-white text-ink/75"}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {f.fieldType === "QR_CODE" && (
                          <QrCode
                            size={13}
                            className="text-blue-600 shrink-0"
                          />
                        )}
                        {f.fieldType === "IMAGE" && (
                          <ImagePlus
                            size={13}
                            className="text-purple-600 shrink-0"
                          />
                        )}
                        {f.fieldType === "INVITEE_NAME" && (
                          <User
                            size={13}
                            className="text-emerald-600 shrink-0"
                          />
                        )}
                        {f.fieldType === "TEXT" && (
                          <FileText
                            size={13}
                            className="text-marigold shrink-0"
                          />
                        )}
                        <span className="truncate">{f.fieldLabel}</span>
                        <span className="text-[10px] text-ink/40 font-mono">
                          ({f.positionX}%, {f.positionY}%)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeField(f.id);
                        }}
                        className="text-ink/30 hover:text-red-500 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN (7 cols): INTERACTIVE CANVAS & INSPECTOR
                ======================================================== */}
            <div className="lg:col-span-7 space-y-4">
              {/* The Interactive Visual Canvas */}
              <div className="glass-card p-3">
                <div className="flex justify-between items-center text-xs font-semibold text-ink/60 mb-2 px-1">
                  <span>Interactive Card Canvas</span>
                  <span className="text-marigold-700">
                    Drag items to position them
                  </span>
                </div>

                <div
                  ref={canvasRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative aspect-[3/4] max-w-sm mx-auto bg-gradient-to-br from-sand-100 to-blush/20 rounded-3xl overflow-hidden border-2 border-dashed border-ink/20 shadow-md select-none touch-none"
                  style={{
                    backgroundImage: form.previewImageUrl
                      ? `url(${assetUrl(form.previewImageUrl)})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "480px",
                  }}
                >
                  {/* Draggable Positioned Elements */}
                  {fields.map((field) => {
                    const isSelected = selectedField?.id === field.id;
                    return (
                      <div
                        key={field.id}
                        onPointerDown={(e) => handlePointerDown(e, field)}
                        className={`absolute cursor-grab active:cursor-grabbing p-1 rounded-xl transition-shadow ${isSelected ? "ring-2 ring-marigold shadow-lg scale-105 z-20" : "hover:ring-1 hover:ring-marigold/60 z-10"} ${field.fieldType === "QR_CODE" ? "bg-white/95 border-2 border-blue-400" : field.fieldType === "IMAGE" ? "bg-white/95 border-2 border-purple-400" : field.fieldType === "INVITEE_NAME" ? "bg-white/95 border-2 border-emerald-400" : "bg-white/90 backdrop-blur-sm shadow-sm"}`}
                        style={{
                          left: `${field.positionX}%`,
                          top: `${field.positionY}%`,
                          transform: "translate(-50%, -50%)",
                          width:
                            field.fieldType === "IMAGE" ||
                            field.fieldType === "QR_CODE"
                              ? `${field.imageWidth || 90}px`
                              : `${field.width || 60}%`,
                          height:
                            field.fieldType === "QR_CODE"
                              ? `${field.imageWidth || 90}px`
                              : undefined,
                          textAlign: field.textAlign || "center",
                        }}
                      >
                        {field.fieldType === "QR_CODE" && (
                          <div className="flex flex-col items-center justify-center p-1 text-blue-800">
                            <QrCode
                              size={Math.min(field.imageWidth || 90, 60)}
                            />
                            <span className="text-[9px] font-bold font-mono mt-0.5">
                              GATE QR
                            </span>
                          </div>
                        )}

                        {field.fieldType === "IMAGE" && (
                          <div className="flex flex-col items-center justify-center p-2 text-purple-800 h-24 bg-purple-50 rounded-lg">
                            <ImagePlus size={28} />
                            <span className="text-[9px] font-bold mt-1">
                              Photo Slot
                            </span>
                          </div>
                        )}

                        {field.fieldType === "INVITEE_NAME" && (
                          <div className="px-2 py-1 text-emerald-800 text-center font-bold">
                            <span
                              style={{
                                fontSize: `${field.fontSize || 20}px`,
                                fontFamily:
                                  field.fontFamily || "Playfair Display",
                                color: field.fontColor || "#26201A",
                              }}
                            >
                              {"{Guest Name}"}
                            </span>
                          </div>
                        )}

                        {field.fieldType === "TEXT" && (
                          <div
                            className="px-2 py-1 leading-tight select-none"
                            style={{
                              fontSize: `${field.fontSize || 22}px`,
                              fontFamily:
                                field.fontFamily || "Playfair Display",
                              color: field.fontColor || "#26201A",
                            }}
                          >
                            {field.fieldLabel}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {fields.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-ink/40 text-xs font-semibold">
                      Add elements from the left panel to begin design
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Element Style Inspector */}
              {selectedField && (
                <div className="bg-sand-100/90 p-5 rounded-2xl border border-white space-y-3">
                  <div className="flex items-center justify-between border-b border-ink/8 pb-2">
                    <h3 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                      <Sparkles size={14} className="text-marigold" />
                      <span>Styling: {selectedField.fieldLabel}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedField(null)}
                      className="text-ink/40 hover:text-ink text-xs font-bold"
                    >
                      Close Inspector
                    </button>
                  </div>

                  {/* QR / Image size controls */}
                  {(selectedField.fieldType === "QR_CODE" ||
                    selectedField.fieldType === "IMAGE") && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-ink/75 block mb-1">
                          {selectedField.fieldType === "QR_CODE"
                            ? "QR Size (px)"
                            : "Width (px)"}
                        </label>
                        <input
                          type="number"
                          className="clay-input !py-1 text-xs"
                          value={selectedField.imageWidth || 90}
                          onChange={(e) =>
                            updateField(selectedField.id, {
                              imageWidth: Number(e.target.value),
                              imageHeight: Number(e.target.value),
                            })
                          }
                          min={40}
                          max={220}
                        />
                      </div>
                    </div>
                  )}

                  {/* Text properties controls */}
                  {selectedField.fieldType !== "QR_CODE" &&
                    selectedField.fieldType !== "IMAGE" && (
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-ink/70 block mb-1">
                            Label Text
                          </label>
                          <input
                            className="clay-input !py-1 text-xs"
                            value={selectedField.fieldLabel}
                            onChange={(e) =>
                              updateField(selectedField.id, {
                                fieldLabel: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="font-bold text-ink/70 block mb-1">
                            Font Size ({selectedField.fontSize || 24}px)
                          </label>
                          <input
                            type="range"
                            min={12}
                            max={48}
                            className="w-full accent-marigold"
                            value={selectedField.fontSize || 24}
                            onChange={(e) =>
                              updateField(selectedField.id, {
                                fontSize: Number(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="font-bold text-ink/70 block mb-1">
                            Typography Face
                          </label>
                          <select
                            className="clay-input !py-1 text-xs font-semibold"
                            value={
                              selectedField.fontFamily || "Playfair Display"
                            }
                            onChange={(e) =>
                              updateField(selectedField.id, {
                                fontFamily: e.target.value,
                              })
                            }
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option
                                key={font.name}
                                value={font.name}
                                style={{
                                  fontFamily: font.name,
                                }}
                              >
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-ink/70 block mb-1">
                            Font Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              className="w-8 h-8 rounded-lg cursor-pointer border border-ink/10"
                              value={selectedField.fontColor || "#26201A"}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  fontColor: e.target.value,
                                })
                              }
                            />
                            <span className="font-mono text-xs">
                              {selectedField.fontColor || "#26201A"}
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-ink/70 block mb-1">
                            Text Alignment
                          </label>
                          <div className="flex gap-2">
                            {["left", "center", "right"].map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() =>
                                  updateField(selectedField.id, {
                                    textAlign: align,
                                  })
                                }
                                className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${selectedField.textAlign === align ? "bg-marigold text-white border-marigold" : "bg-white/80 text-ink/70 border-ink/10"}`}
                              >
                                {align === "left" && <AlignLeft size={13} />}
                                {align === "center" && (
                                  <AlignCenter size={13} />
                                )}
                                {align === "right" && <AlignRight size={13} />}
                                <span className="capitalize">{align}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Master Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="clay-btn-primary !w-full !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Save size={16} />
                <span>
                  {saving
                    ? "Saving Template Layout..."
                    : "Save Complete Card Layout"}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
