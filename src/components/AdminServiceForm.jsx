import FreeServiceFields from "./FreeServiceFields";
import ProviderFields from "./ProviderFields";
import RefillPolicyFields from "./RefillPolicyFields";

const AdminServiceForm = ({
  form,
  handleChange,
  handleSubmit,
  providers,
  isAddingNewProvider,
  selectedService,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8 mb-10 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <input name="platform" placeholder="Platform *" value={form.platform} onChange={handleChange} className="p-3 border rounded-lg" required />
        <input name="category" placeholder="Category *" value={form.category} onChange={handleChange} className="p-3 border rounded-lg" required />
        <input name="name" placeholder="Service Name *" value={form.name} onChange={handleChange} className="p-3 border rounded-lg" required />

        <ProviderFields
          form={form}
          handleChange={handleChange}
          providers={providers}
          isAddingNewProvider={isAddingNewProvider}
        />

        <input name="providerServiceId" placeholder="Provider Service ID" value={form.providerServiceId} onChange={handleChange} className="p-3 border rounded-lg" />

        <input type="number" step="0.0001" name="rate" placeholder="Rate per 1000" value={form.rate} onChange={handleChange} disabled={form.isFree} className="p-3 border rounded-lg" />

        <input type="number" name="min" placeholder="Min" value={form.min} onChange={handleChange} className="p-3 border rounded-lg" />
        <input type="number" name="max" placeholder="Max" value={form.max} onChange={handleChange} className="p-3 border rounded-lg" />
      </div>

      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full p-3 border rounded-lg" />

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} />
        🎁 Free Service
      </label>

      <FreeServiceFields form={form} handleChange={handleChange} />

      <div className="flex flex-wrap gap-6 pt-4">
        {[
          ["refillAllowed", "Refill Allowed"],
          ["cancelAllowed", "Cancel Allowed"],
          ["isDefault", "Default Service"],
          ["isDefaultCategoryGlobal", "Global Default Category"],
          ["isDefaultCategoryPlatform", "Platform Default Category"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
            {label}
          </label>
        ))}
      </div>

      <RefillPolicyFields form={form} handleChange={handleChange} />

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
        {selectedService ? "Update Service" : "Add Service"}
      </button>
    </form>
  );
};

export default AdminServiceForm;
