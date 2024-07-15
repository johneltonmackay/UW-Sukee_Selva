/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/task', 'N/runtime', './config'], /**
 * @param{task} task
 * @param{runtime} runtime
 * @param{conf} conf
 */ (task, runtime, conf) => {
    /**
     * Defines the Scheduled script trigger point.
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
     * @since 2015.2
     */
    const execute = (scriptContext) => {
        try {
            var searchTask = task.create({
                taskType: task.TaskType.SEARCH
            });
            searchTask.savedSearchId = conf[runtime.envType].savedSearchId;
            searchTask.fileId = conf[runtime.envType].fileId;
            var searchTaskId = searchTask.submit();
            log.debug('searchTaskId',searchTaskId);
            const taskStatus = task.checkStatus(searchTaskId);
            log.debug('taskStatus',taskStatus);
            log.debug('taskStatus.status',taskStatus.status);
            if (taskStatus.status === task.TaskStatus.COMPLETE) {
                log.audit('Export completed', 'Export completed');
            }
        } catch (e) {
            log.error('UNEXPECTED_ERROR', e);
        }
    };

    return {execute};
});
