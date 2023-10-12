import { block } from 'million/react';

const AUTO_ARCHIVE_OPTIONS = [
  3 * 86400, // 3 days
  7 * 86400, // 7 days
  14 * 86400, // 2 weeks
  28 * 86400, // 4 weeks
  90 * 86400, // 3 months
  365 * 864000, // 1 year
];

const ArchiveAllPrefGroup = block(() => {
  const onChange = () => {};
  return (
    <div className="prefs-group">
      <div className="label-wrapper">
        <label>
          <div>
            <div>
              Auto archive
              <select onChange={onChange}>
                <option value="all">all</option>
                <option value="unread">unread</option>
              </select>
              threads older than
            </div>
            <select onChange={onChange}>
              {AUTO_ARCHIVE_OPTIONS.map((seconds) => (
                <option key={seconds} value={String(seconds)}>
                  {String(seconds * 1000)}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
    </div>
  );
});

export default ArchiveAllPrefGroup;
