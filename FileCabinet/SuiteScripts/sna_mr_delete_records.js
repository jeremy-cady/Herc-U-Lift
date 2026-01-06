/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search) => {

        const parseJSON = (data) => {
            if (typeof data == "string") data = JSON.parse(data);
            return data;
        }

        const getInputData = (inputContext) => {
            return search.load({id: 497});
        }

        const map = (mapContext) => {
            // log.debug({title: "Context", details: mapContext});
            let values = parseJSON(mapContext.value);
            let options = {type: values.recordType, id: values.id};
            log.debug({title: "Data", details: {options}});
          try {           
            record.delete(options);
          } catch (error) {
            log.error({title:"Error",details:error});
          }
            
        }

        return {getInputData, map}

    });
