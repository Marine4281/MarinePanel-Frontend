const ProviderFields = ({
  form,
  handleChange,
  providers,
  isAddingNewProvider,
}) => {
  return (
    <>
      <select
        name="providerProfileId"
        value={form.providerProfileId}
        onChange={handleChange}
        className="p-3 border rounded-lg"
        required
      >
        <option value="">Select Provider</option>

        {providers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}

        <option value="new">➕ Add New Provider</option>
      </select>

      {isAddingNewProvider && (
        <>
          <input name="newProviderName" placeholder="New Provider Name" value={form.newProviderName} onChange={handleChange} className="p-3 border rounded-lg" />
          <input name="providerApiUrl" placeholder="API URL" value={form.providerApiUrl} onChange={handleChange} className="p-3 border rounded-lg" />
          <input name="providerApiKey" placeholder="API Key" value={form.providerApiKey} onChange={handleChange} className="p-3 border rounded-lg" />
        </>
      )}
    </>
  );
};

export default ProviderFields;
