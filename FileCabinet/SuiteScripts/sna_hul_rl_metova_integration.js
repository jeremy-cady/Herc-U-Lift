/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
/**
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Script is used for Metova Integration
 *
 *
 * Revision History:
 *
 * Date              Issue/Case             Author               	    Issue Fix Summary
 * =============================================================================================
 * 07-09-2024                               Amol Jagkar             	Initial version
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (record, runtime, search) => {

        let dateFields = [
            "custrecord_sna_production_date",
            "custrecord_sna_last_meter_reading_m1",
            "custrecord_sna_last_meter_reading_m2",
            "custrecord_sna_posting_date",
            "custrecord_sna_warranty_expiration_date",
            "custrecord_sna_warranty_exp_date_engine",
            "custrecord_sna_on_hold_date_until",
            "custrecord_sna_sales_order_date",
            "custrecord_sna_sales_date",
            "custrecord_sna_installation_date",
            "custrecord_sna_vendor_shipment_date",
            "custrecord_sna_lease_expiration_date",
            "custrecord_sna_expected_rep_date",
            "custrecord_sna_purchase_date",
            "custrecord_sna_rerent_end_date",
            "custrecord_sna_expected_receipt_date",
            "custrecord_sna_expected_delivery_date",
            "custrecord_sna_exp_rental_return_date",
            "custrecord_sna_rental_contract_sec_date",
            "custrecord_sna_warranty_period",
            "custrecord_sna_warranty_period_engine",
            "custrecord_sna_acq_date",
            "custrecord_sna_dep_start_date",
            "custrecord_sna_next_pm_date",
            "custrecord_sna_next_inspection_date",
            "custrecord_sna_last_pm_date",
            "custrecord_sna_contract_finish_date",
            "custrecord_sna_last_inspection_date",
            "custrecord_sna_hul_date"
        ];

        const getObjectName = (id) => {
            return search.lookupFields({type: "customrecord_sna_objects", id, columns: "name"}).name;
        }

        const processObject = (method, requestBody) => {
            let objectRecord;

            if (method === "POST")
                objectRecord = record.create({type: "customrecord_sna_objects"});
            else if (method === "PUT")
                objectRecord = record.load({type: "customrecord_sna_objects", id: requestBody.id});

            let values = {
                "name": requestBody.objectId,
                "custrecord_sna_fleet_code": requestBody.fleetCode,
                "custrecord_sna_serial_no": requestBody.serialNo,
                "cseg_sna_hul_eq_seg": requestBody.equipmentPosting,
                "cseg_hul_mfg": requestBody.manufacturer,
                "custrecord_sna_equipment_model": requestBody.equipmentModel,
                "custrecord_sna_year": requestBody.year,
                "custrecord_hul_meter_key_static": requestBody.meterKeyM1,
                "custrecordcustrecord_hul_gps_serial": requestBody.gpsSerial

                /*"custrecord_sna_hul_cust_eq_no": requestBody.customerEquipmentNo,
                "custrecord_sna_no_fleet_code": requestBody.noFleetCode,
                "custrecord_sna_no": requestBody.no,
                "custrecord_sna_asset_type": requestBody.assetType,
                "custrecord_sna_hul_translation_type": requestBody.translationType,
                "custrecord_sna_hul_segment_grouping": requestBody.segmentGrouping,
                "custrecord_sna_hul_segment": requestBody.segment,
                // "custrecord30": requestBody.custrecord30,
                "custrecord_sna_hul_inventory_object": requestBody.inventoryObject,
                "custrecord_hul_customerorder": requestBody.customerOrder,
                // "custrecord31": requestBody.custrecord31,
                "custrecord_hul_nxcequipasset": requestBody.nxcEquipAsset,
                // "cseg1": requestBody.cseg1,
                "custrecord_sna_blocked": requestBody.blocked,
                "custrecord_sna_linked_to_object": requestBody.linkedToObject,
                "custrecord_sna_owner_status": requestBody.ownerStatus,
                "custrecord_sna_comment": requestBody.comment,
                "custrecord_sna_model_description_2": requestBody.modelDescription,
                "custrecord_sna_description": requestBody.description,
                "custrecord_sna_production_date": requestBody.productionDate,
                "custrecord_sna_equipment_category": requestBody.equipmentCategory,
                "custrecord_sna_equipment_group": requestBody.equipmentGroup,
                "custrecord_sna_equipment_sub_model": requestBody.equipmentSubModel,
                "custrecord_sna_posting_status": requestBody.postingStatus,
                "custrecord_sna_status": requestBody.status,
                "custrecord_sna_rental_status": requestBody.rentalStatus,
                "custrecord_sna_prior_posting_status": requestBody.priorPostingStatus,
                "custrecord_sna_owning_loc_code": requestBody.owningLocationCode,
                "custrecord_sna_lease_company_id": requestBody.leaseCompanyId,
                "custrecord_sna_man_code": requestBody.manufacturerCode,
                "custrecord_sna_meter_key_on_m1": requestBody.meterKeyM1,
                "custrecord_sna_last_meter_reading_m1": requestBody.lastMeterReadingM1,
                "custrecord_sna_m2": requestBody.meterKeyM2,
                "custrecord_sna_last_meter_reading_m2": requestBody.lastMeterReadingM2,
                "custrecord_sna_rental_contract_no_so": requestBody.rentalContractNoSo,
                "custrecord_sna_capital_expenditure": requestBody.capitalExpenditure,
                "custrecord_sna_posting_date": requestBody.postingDate,
                "custrecord_sna_depreciation_posted": requestBody.depreciationPosted,
                "custrecord_sna_warranty_expiration_date": requestBody.warrantyExpirationDate,
                "custrecord_sna_warranty_exp_date_engine": requestBody.warrantyExpDateEngine,
                "custrecord_sna_on_hold_salesperson": requestBody.onHoldSalesperson,
                "custrecord_sna_on_hold_date_until": requestBody.onHoldDateUntil,
                "custrecord_sna_sold_by_salesperson": requestBody.soldBySalesperson,
                "custrecord_sna_sales_order_no": requestBody.salesOrderNo,
                "custrecord_sna_sales_order_date": requestBody.salesOrderDate,
                "custrecord_sna_sales_date": requestBody.salesDate,
                "custrecord_sna_installation_date": requestBody.installationDate,
                "custrecord_sna_vendor_shipment_date": requestBody.vendorShipmentDate,
                "custrecord_sna_lease_expiration_date": requestBody.leaseExpirationDate,
                "custrecord_sna_leased_type": requestBody.leasedType,
                "custrecord_sna_leased_from_vendor_no": requestBody.leasedFromVendorNo,
                "custrecord_sna_leased_contract_no": requestBody.leasedContractNo,
                "custrecord_sna_visible": requestBody.visible,
                "custrecord_sna_expected_rep_date": requestBody.expectedReplacementDate,
                "custrecord_sna_expected_rep_value": requestBody.expectedReplacementValue,
                "custrecord_sna_purchase_date": requestBody.purchaseDate,
                "custrecord_sna_rerent_end_date": requestBody.rerentEndDate,
                "custrecord_sna_rerent_vendor_return_no": requestBody.rerentVendorReturnNo,
                "custrecord_sna_expected_receipt_date": requestBody.expectedReceiptDate,
                "custrecord_sna_expected_delivery_date": requestBody.expectedDeliveryDate,
                "custrecord_sna_vendor_no": requestBody.vendorNo,
                "custrecord_sna_vendor_position_no": requestBody.vendorPositionNo,
                "custrecord_sna_vendor_order_no": requestBody.vendorOrderNo,
                "custrecord_sna_exp_rental_return_date": requestBody.expectedRentalReturnDate,
                "custrecord_sna_rental_contract_no": requestBody.rentalContractNo,
                "custrecord_sna_new_rental_contract_no": requestBody.newRentalContractNo,
                "custrecord_sna_rental_contract_sec_date": requestBody.rentalContractSecDate,
                "custrecord_sna_sales_price_adj": requestBody.salesPriceAdj,
                "custrecord_sna_bv_setting_sales_price": requestBody.bookvvalueSettingSalesPrice,
                "custrecord_sna_hul_obj_commissionable_bv": requestBody.objCommissionableBookvalue,
                "custrecord_sna_sales_price": requestBody.salesPrice,
                "custrecord_sna_tax_group_code": requestBody.taxGroupCode,
                "custrecord_sna_equipment_posting_group": requestBody.equipmentPostingGroup,
                "custrecord_sna_picture": requestBody.picture,
                "custrecord_sna_depreciation_cost_code": requestBody.depreciationCostCode,
                "custrecord_sna_fixed_asset": requestBody.fixedAsset,
                "custrecord_sna_warranty_period": requestBody.warrantyPeriod,
                "custrecord_sna_warranty_period_source": requestBody.warrantyPeriodSource,
                "custrecord_sna_warranty_period_engine": requestBody.warrantyPeriodEngine,
                "custrecord_sna_warranty_period_source_en": requestBody.warrantyPeriodSourceEngine,
                "custrecord_sna_responsibility_center": requestBody.responsibilityCenter,
                "custrecord_sna_new_bv": requestBody.newBookvalue,
                "custrecord_sna_bv_adj_acct": requestBody.bookvalueAdjAccount,
                "custrecord_sna_acq_date": requestBody.acquisitionDate,
                "custrecord_sna_dep_start_date": requestBody.depreciationStartDate,
                "custrecord_sna_transportation_status": requestBody.transportationStatus,
                "custrecord_sna_customer_no": requestBody.customerNo,
                "custrecord_sna_customer_name": requestBody.customerName,
                "custrecord_sna_contact": requestBody.contact,
                "custrecord_sna_bill_to_customer_no": requestBody.billToCustomerNo,
                "custrecord_sna_bill_to_name": requestBody.billToCame,
                "custrecord_sna_latitude": requestBody.latitude,
                "custrecord_sna_longitude": requestBody.longitude,
                "custrecord_sna_current_object_loc": requestBody.currentObjectLocation,
                "custrecord_sna_current_code": requestBody.currentCode,
                "custrecord_sna_current_country_code": requestBody.currentCountryCode,
                "custrecord_sna_default_rental_return_loc": requestBody.defaultRentalReturnLocation,
                "custrecord_sna_current_fax_no": requestBody.currentFaxNo,
                "custrecord_sna_current_name": requestBody.currentName,
                "custrecord_sna_current_city": requestBody.currentCity,
                "custrecord_sna_current_post_code": requestBody.currentPostCode,
                "custrecord_sna_current_address": requestBody.currentAddress,
                "custrecord_sna_current_address_2": requestBody.currentAddress2,
                "custrecord_sna_current_phone_no": requestBody.currentPhoneNo,
                "custrecord_sna_current_email": requestBody.currentEmail,
                "custrecord_sna_work_height": requestBody.workHeight,
                "custrecord_sna_frame_no": requestBody.frameNo,
                "custrecord_sna_power": requestBody.power,
                "custrecord_sna_capacity": requestBody.capacity,
                "custrecord_sna_tires": requestBody.tires,
                "custrecord_sna_height": requestBody.height,
                "custrecord_sna_warranty_type": requestBody.warrantyType,
                "custrecord_sna_forks": requestBody.forks,
                "custrecord_sna_pm_type": requestBody.pmType,
                "custrecord_sna_gps_asset_tag": requestBody.gpsAssetTag,
                "custrecord_sna_eng_make": requestBody.engMake,
                "custrecord_sna_eng_model": requestBody.engModel,
                "custrecord_sna_eng_serial": requestBody.engSerial,
                "custrecord_sna_eng_year": requestBody.engYear,
                "custrecord_sna_eng_code": requestBody.engCode,
                "custrecord_sna_eng_type": requestBody.engType,
                "custrecord_sna_eng_warranty": requestBody.engWarranty,
                "custrecord_sna_frame_no2": requestBody.frameNo2,
                "custrecord_sna_conv_hour_meter": requestBody.convHourMeter,
                "custrecord_sna_part_no_mast_chain": requestBody.partnoMastChain,
                "custrecord_sna_part_no_attach": requestBody.partnoAttach,
                "custrecord_sna_part_no_tires": requestBody.partnoTires,
                "custrecord_sna_transmission": requestBody.transmission,
                "custrecord_sna_fuel_kit_no": requestBody.fuelKitno,
                "custrecord_sna_battery_charger_no": requestBody.batteryChargerno,
                "custrecord_sna_batt_replaced": requestBody.batteryReplaced,
                "custrecord_sna_config_notes": requestBody.configNotes,
                "custrecord_sna_raised_platform_height": requestBody.raisedPlatformHeight,
                "custrecord_sna_lowered_platform_height": requestBody.loweredPlatformHeight,
                "custrecord_sna_overall_width": requestBody.overallWidth,
                "custrecord_sna_overall_length": requestBody.overallLength,
                "custrecord_sna_stowed_height_rails_up": requestBody.stowedHeightRailsUp,
                "custrecord_sna_stowed_height_rails_down": requestBody.stowedHeightRailsDown,
                "custrecord_sna_platform_width_inside_dim": requestBody.platformWidthInsideDim,
                "custrecord_sna_platform_length_inside_di": requestBody.platformLengthInsideDim,
                "custrecord_sna_extension_deck_roll_out": requestBody.extensionDeckRollout,
                "custrecord_sna_ground_clearance_raised": requestBody.groundClearanceRaised,
                "custrecord_sna_wheelbase": requestBody.wheelbase,
                "custrecord_sna_weight": requestBody.weight,
                "custrecord_sna_gradeability": requestBody.gradeability,
                "custrecord_sna_maximum_drive_height": requestBody.maximumDriveHeight,
                "custrecord_sna_capacity_new": requestBody.capacityNew,
                "custrecord_sna_max_no_of_persons": requestBody.maxNoOfPersons,
                "custrecord_sna_tire_type": requestBody.tireType,
                "custrecord_sna_tire_size": requestBody.tireSize,
                "custrecord_sna_wind_rating": requestBody.windRating,
                "custrecord_sna_diesel_engine": requestBody.dieselEngine,
                "custrecord_sna_fuel_tank": requestBody.fuelTank,
                "custrecord_sna_hydraulic_reservoir": requestBody.hydraulicReservoir,
                "custrecord_sna_battery_type": requestBody.batteryType,
                "custrecord_sna_battery_quantity": requestBody.batteryQuantity,
                "custrecord_sna_accessories": requestBody.accessories,
                "custrecord_sna_entry_door_type": requestBody.entryDoorType,
                "custrecord_sna_ground_clearance": requestBody.groundClearance,
                "custrecord_sna_turning_radius_outside": requestBody.turningRadiusOutside,
                "custrecord_sna_max_lift_capacity": requestBody.maxLiftCapacity,
                "custrecord_sna_max_lift_height": requestBody.maxLiftHeight,
                "custrecord_sna_max_forward_reach": requestBody.maxForwardReach,
                "custrecord_sna_oa_length_less_forks": requestBody.oaLengthLessForks,
                "custrecord_sna_overall_height_stowed": requestBody.overallHeightStowed,
                "custrecord_sna_operating_weight": requestBody.operatingWeight,
                "custrecord_sna_tires_new": requestBody.tiresNew,
                "custrecord_sna_joystick_configuration": requestBody.joystickConfiguration,
                "custrecord_sna_cab_style": requestBody.cabStyle,
                "custrecord_sna_forks_new": requestBody.forksNew,
                "custrecord_sna_attachments": requestBody.attachments,
                "custrecord_sna_mast_mbr_style": requestBody.mastMbrStyle,
                "custrecord_sna_axle_model": requestBody.axleModel,
                "custrecord_sna_axle_serial": requestBody.axleSerial,
                "custrecord_sna_transmission_model": requestBody.transmissionModel,
                "custrecord_sna_transmission_serial": requestBody.transmissionSerial,
                "custrecord_sna_engine_model": requestBody.engineModel,
                "custrecord_sna_engine_serial": requestBody.engineSerial,
                "custrecord_sna_skyjack_3219": requestBody.skyjack_3219,
                "custrecord_sna_skyjack_1056th": requestBody.skyjack_1056th,
                "custrecord_sna_skyjack_60aj": requestBody.skyjack_60aj,
                "custrecord_sna_skyjack_60t": requestBody.skyjack_60t,
                "custrecord_sna_jlg_e400": requestBody.jlg_e400,
                "custrecord_sna_nifty_sd64": requestBody.nifty_sd64,
                "custrecord_sna_nifty_tm42t": requestBody.nifty_tm42t,
                "custrecord_sna_platform_height": requestBody.platformHeight,
                "custrecord_sna_platform_size": requestBody.platformSize,
                "custrecord_sna_stowed_width": requestBody.stowedWidth,
                "custrecord_sna_stowed_height": requestBody.stowedHeight,
                "custrecord_sna_transportation_height": requestBody.transportationHeight,
                "custrecord_sna_stowed_length": requestBody.stowedLength,
                "custrecord_sna_transportation_length": requestBody.transportationLength,
                "custrecord_sna_jib_length": requestBody.jibLength,
                "custrecord_sna_horizontal_reach": requestBody.horizontalReach,
                "custrecord_sna_power_new": requestBody.powerNew,
                "custrecord_sna_working_width_w_outrigger": requestBody.workingWidthWOTrigger,
                "custrecord_sna_mitsubishi_fb16pnt_fb20pn": requestBody.mitsubishi_fb16pnt_fb20pn,
                "custrecord_sna_load_center": requestBody.loadCenter,
                "custrecord_sna_wheels_no_front_rear": requestBody.wheelsnoFrontRear,
                "custrecord_sna_maximum_fork_height": requestBody.maximumForkHeight,
                "custrecord_sna_overall_height_w_mast_rai": requestBody.overallHeightWMastRai,
                "custrecord_sna_free_lift": requestBody.freeLift,
                "custrecord_sna_fork_dime_thick_wid_lengt": requestBody.forkDimThickWidthLength,
                "custrecord_sna_fork_carriage_to_din_15_1": requestBody.forkCarriageTo_din_15_1,
                "custrecord_sna_tilt_forward_backward": requestBody.tiltForwardBackward,
                "custrecord_sna_length_to_fork_face": requestBody.lengthToForkFace,
                "custrecord_sna_overall_chassis_width": requestBody.overallChassisWidth,
                "custrecord_sna_overall_lowered_height": requestBody.overallLoweredHeight,
                "custrecord_sna_height_to_top_of_overhead": requestBody.heightToTopOfOverhead,
                "custrecord_sna_load_dis_axle_to_fork_fac": requestBody.loadDistanceAxleToForkFace,
                "custrecord_sna_aisle_width_1000_1200": requestBody.aisleWidth_1000_1200,
                "custrecord_sna_aisle_width_800_1200": requestBody.aisleWidth_800_1200,
                "custrecord_sna_min_aisle_90_stack": requestBody.minAisle_90_stack,
                "custrecord_sna_empty_with_min_weight": requestBody.emptyWithMinWeight,
                "custrecord_sna_tire_size_drive": requestBody.tireSizeDrive,
                "custrecord_sna_tire_size_steer": requestBody.tireSizeSteer,
                "custrecord_sna_battery_weight_minimum": requestBody.batteryWeightMinimum,
                "custrecord_sna_battery_weight_maximum": requestBody.batteryWeightMaximum,
                "custrecord_sna_mast_serial_number": requestBody.mastSerialNumber,
                "custrecord_sna_mast_model_number": requestBody.mastModelNumber,
                "custrecord_sna_mast_cylinder_numbers": requestBody.mastCylinderNumbers,
                "custrecord_sna_battery_comp_size_max": requestBody.batteryCompSizeMax,
                "custrecord_sna_wheelbase_on_rail": requestBody.wheelbaseOnRail,
                "custrecord_sna_wheelbase_on_road": requestBody.wheelbaseOnRoad,
                "custrecord_sna_clearance_on_rail": requestBody.clearanceOnRail,
                "custrecord_sna_clearance_on_road": requestBody.clearanceOnRoad,
                "custrecord_sna_height_on_rail": requestBody.heightOnRail,
                "custrecord_sna_height_on_road": requestBody.heightOnRoad,
                "custrecord_sna_engine_make": requestBody.engineMake,
                "custrecord_sna_fuel_tank_size": requestBody.fuelTankSize,
                "custrecord_sna_transmission_make": requestBody.transmissionMake,
                "custrecord_sna_axle_on_rail_serial": requestBody.axleOnRailSerial,
                "custrecord_sna_axle_on_road_serial": requestBody.axleOnRoadSerial,
                "custrecord_sna_train_air_compressors": requestBody.trainAirCompressors,
                "custrecord_sna_alternator": requestBody.alternator,
                "custrecord_sna_digital_instrumentation": requestBody.digitalInstrumentation,
                "custrecord_sna_tires_wheels_on_rail": requestBody.tiresWheelsOnRail,
                "custrecord_sna_tires_wheels_on_rail_qty": requestBody.tiresWheelsOnRailQty,
                "custrecord_sna_tires_wheels_on_road": requestBody.tiresWheelsOnRoad,
                "custrecord_sna_tires_wheels_on_road_qty": requestBody.tiresWheelsOnRoadQty,
                "custrecord_sna_trackmobile_titan_railcar": requestBody.trackmobileTitanRailcar,
                "custrecord_sna_installed_options": requestBody.installedOptions,
                "custrecord_sna_cab_options": requestBody.cabOptions,
                "custrecord_sna_not_for_sales": requestBody.notForSales,
                "custrecord_sna_next_pm_date": requestBody.nextPmDate,
                "custrecord_sna_next_inspection_date": requestBody.nextInspectionDate,
                "custrecord_sna_next_pm_hours": requestBody.nextPmHours,
                "custrecord_sna_next_inspection_hours": requestBody.nextInspectionHours,
                "custrecord_sna_last_pm_date": requestBody.lastPmDate,
                "custrecord_sna_last_pm_hours": requestBody.lastPmHours,
                "custrecord_sna_last_inspection_hours": requestBody.lastInspectionHours,
                "custrecord_sna_last_pm_action": requestBody.last_pm_action,
                "custrecord_sna_last_inspection_action": requestBody.lastInspectionAction,
                "custrecord_sna_contract_finish_date": requestBody.contractFinishDate,
                "custrecord_sna_last_pm_contact_user": requestBody.lastPmContactUser,
                "custrecord_sna_pm_action": requestBody.pmAction,
                "custrecord_sna_next_inspection_action": requestBody.nextInspectionAction,
                "custrecord_sna_contract_type": requestBody.contractType,
                "custrecord_sna_preferred_resource_no": requestBody.preferredResourceNo,
                "custrecord_sna_planned_service": requestBody.plannedService,
                "custrecord_sna_last_inspection_date": requestBody.lastInspectionDate,
                "custrecord_sna_availability": requestBody.availability,
                "custrecord_sna_rental_income": requestBody.rentalIncome,
                "custrecord_sna_cost": requestBody.cost,
                "custrecord_sna_expected_cost": requestBody.expectedCost,
                "custrecord_sna_total_purchase": requestBody.totalPurchase,
                "custrecord_sna_purchase": requestBody.purchase,
                "custrecord_sna_enhancements": requestBody.enhancements,
                "custrecord_sna_presales_cost": requestBody.presalesCost,
                "custrecord_sna_delivery": requestBody.delivery,
                "custrecord_sna_after_sales_cost": requestBody.afterSalesCost,
                "custrecord_sna_over_allowance": requestBody.overAllowance,
                "custrecord_sna_depreciation": requestBody.depreciation,
                "custrecord_sna_adjustments": requestBody.adjustments,
                "custrecord_sna_fiscal_depreciation": requestBody.fiscalDepreciation,
                "custrecord_sna_fiscal_adjustments": requestBody.fiscalAdjustments,
                "custrecord_sna_book3_depreciation": requestBody.book3Depreciation,
                "custrecord_sna_book3_depreciation_deact": requestBody.book3DepreciationDeact,
                "custrecord_sna_sale": requestBody.sale,
                "custrecord_sna_deactivation_purchase": requestBody.deactivationPurchase,
                "custrecord_sna_deactivation_depreciation": requestBody.deactivationDepreciation,
                "custrecord_sna_eactivation_presales_cost": requestBody.eactivationPresalesCost,
                "custrecord_sna_deactivation_fiscal_depre": requestBody.deactivationFiscalDepre,
                "custrecord_sna_sales_claims": requestBody.salesClaims,
                "custrecord_sna_overtime_bill_main_contr": requestBody.overtimeBillMainContr,
                "custrecord_sna_rental_contract_overtime": requestBody.rentalContractOvertime,
                "custrecord_sna_maintenance_claims": requestBody.maintenanceClaims,
                "custrecord_sna_invoiced_maintenance_cont": requestBody.invoicedMaintenanceCont,
                "custrecord_sna_maintenance_recognized_sa": requestBody.maintenanceRecognizedSa,
                "custrecord_sna_work_order_usage": requestBody.workOrderUsage,
                "custrecord_sna_deactivation_wo_usage": requestBody.deactivationWoUsage,
                "custrecord_sna_open_transfers": requestBody.openTransfers,
                "custrecord_sna_alllocated_to_work_order": requestBody.allocatedToWorkOrder,
                "custrecord_sna_work_order_sales": requestBody.workorderSales,
                "custrecord_sna_leased_sales_revenue": requestBody.leasedSalesRevenue,
                "custrecord_sna_leased_cost": requestBody.leasedCost,
                "custrecord_sna_leased_wo_cost": requestBody.leasedWoCost,
                "custrecord_sna_remaining_interest": requestBody.remainingInterest,
                "custrecord_sna_remaining_amount": requestBody.remainingAmount,
                "custrecord_sna_posted_interest": requestBody.postedInterest,
                "custrecord_sna_posted_principal": requestBody.postedPrincipal,
                "custrecord_sna_hul_asset_account": requestBody.hulAssetAccount,
                "custrecord_sna_hul_cogs_account": requestBody.hulCogsAccount,
                "custrecord_sna_hul_income_account": requestBody.hulIncomeAccount,
                "custrecord_sna_hul_gain_loss_account": requestBody.hulGainLossAccount,
                "custrecord_sna_hul_lease_co_code": requestBody.hulLeaseCoCode,
                "custrecord_sna_hul_rent_dummy": requestBody.hulRentDummy,
                "custrecord_sna_asset_value": requestBody.assetValue,
                "custrecord_sna_purchase_order": requestBody.purchaseOrder,
                "custrecord_sna_hul_original_cost": requestBody.hulOriginalCost,
                "custrecord_sna_dev": requestBody.dev*/
            }

            for (const fieldId in values) {
                if (!!values[fieldId]) {
                    if (dateFields.includes(fieldId))
                        objectRecord.setValue({fieldId, value: new Date(values[fieldId])});
                    else
                        objectRecord.setValue({fieldId, value: values[fieldId]});
                }
            }

            let objectRecordId = objectRecord.save();
            log.debug({title: "Object Record saved", details: objectRecordId});

            let name = getObjectName(objectRecordId);
            // requestBody.hourMeter.objectRef = objectRecordId;

            // let hourMeterResponse = processHourMeter(method, requestBody.hourMeter);

            return {id: objectRecordId, name/*, hourMeter: hourMeterResponse*/};
        }

        const processHourMeter = (method, requestBody) => {
            let hourMeter;

            if (method === "POST")
                hourMeter = record.create({type: "customrecord_sna_hul_hour_meter"});
            else if (method === "PUT")
                hourMeter = record.load({type: "customrecord_sna_hul_hour_meter", id: requestBody.id});
            log.debug({title: "processHourMeter requestBody", details: requestBody});

            let values = {
                "custrecord_sna_hul_object_ref": requestBody.objectRef,
                "custrecord_sna_hul_external_id": requestBody.externalId,
                "custrecord_sna_hul_date": requestBody.date,
                "custrecord_sna_hul_time": requestBody.time,
                "custrecord_sna_hul_hour_meter_reading": requestBody.hourMeterReading,
                "custrecord_sna_hul_ignore_in_calculation": requestBody.ignoreInCalculation,
                "custrecord_sna_hul_hr_meter_source": requestBody.hourMeterSource,
                "custrecord_sna_hul_source_record": requestBody.sourceRecord,
                "custrecord_sna_hul_actual_reading": requestBody.actualReading,
                "custrecord_sna_hul_meter_used": requestBody.meterUsed,
            };

            for (const fieldId in values) {
                if (!!values[fieldId]) {
                    if (dateFields.includes(fieldId))
                        hourMeter.setValue({fieldId, value: new Date(values[fieldId])});
                    else
                        hourMeter.setValue({fieldId, value: values[fieldId]});
                }
            }

            let hourMeterId = hourMeter.save();
            log.debug({title: "Hour Meter Record saved", details: hourMeterId});

            return {id: hourMeterId};
        }

        const getAllSearchResults = (resultSet) => {
            let batch, batchResults, results = [], searchStart = 0;
            do {
                batch = resultSet.getRange({ start: searchStart, end: searchStart + 1000 });
                batchResults = (batch || []).map(function (row) {
                    searchStart++;
                    return row;
                }, this);
                results = results.concat(batchResults);
            } while ((batchResults || []).length === 1000);

            return results;
        }

        const getObjects = (gpsSerial) => {
            let response = [], objects = [];
            let columnsArray = [
                { columnName: "name", columnLabel: "ID", keyName: "name" },
                { columnName: "custrecord_sna_fleet_code", columnLabel: "Fleet Code", keyName: "fleetCode" },
                { columnName: "custrecord_sna_hul_translation_type", columnLabel: "HUL Translation Type", keyName: "translationType" },
                { columnName: "custrecord_hul_meter_key_static", columnLabel: "Meter Key On (M1)", keyName: "hulMeterKeyStatic" },
                { columnName: "custrecord_sna_linked_to_object", columnLabel: "Linked to Object", keyName: "linkedToObject" },
                { columnName: "custrecord_sna_owner_status", columnLabel: "Owner Status", keyName: "ownerStatus" },
                { columnName: "custrecord_sna_comment", columnLabel: "Comment", keyName: "comment" },
                { columnName: "custrecord_sna_model_description_2", columnLabel: "Model Description 2", keyName: "modelDescription" },
                { columnName: "custrecord_sna_capital_expenditure", columnLabel: "Capital Expenditure", keyName: "capitalExpenditure" },
                { columnName: "custrecord_sna_posting_date", columnLabel: "Posting Date", keyName: "postingDate" },
                { columnName: "custrecord_sna_depreciation_posted", columnLabel: "Depreciation Posted", keyName: "depreciationPosted" },
                { columnName: "custrecord_sna_warranty_expiration_date", columnLabel: "Warranty Expiration Date", keyName: "warrantyExpirationDate" },
                { columnName: "custrecord_sna_warranty_exp_date_engine", columnLabel: "Warranty Exp. Date Engine", keyName: "warrantyExpDateEngine" },
                { columnName: "custrecord_sna_on_hold_salesperson", columnLabel: "On Hold Salesperson", keyName: "onHoldSalesperson" },
                { columnName: "custrecord_sna_on_hold_date_until", columnLabel: "On Hold Date Until", keyName: "onHoldDateUntil" },
                { columnName: "custrecord_sna_sold_by_salesperson", columnLabel: "Sold by Salesperson", keyName: "soldBySalesperson" },
                { columnName: "custrecord_sna_sales_order_no", columnLabel: "Sales Order No.", keyName: "salesOrderNo" },
                { columnName: "custrecord_sna_sales_order_date", columnLabel: "Sales Order Date", keyName: "salesOrderDate" },
                { columnName: "custrecord_sna_sales_date", columnLabel: "Sales Date", keyName: "salesDate" },
                { columnName: "custrecord_sna_installation_date", columnLabel: "Installation Date", keyName: "installationDate" },
                { columnName: "custrecord_sna_vendor_shipment_date", columnLabel: "Vendor Shipment Date", keyName: "vendorShipmentDate" },
                { columnName: "custrecord_sna_lease_expiration_date", columnLabel: "Lease Expiration Date", keyName: "leaseExpirationDate" },
                { columnName: "custrecord_sna_leased_type", columnLabel: "Leased Type", keyName: "leasedType" },
                { columnName: "custrecord_sna_leased_from_vendor_no", columnLabel: "Leased from Vendor No.", keyName: "leasedFromVendorNo" },
                { columnName: "custrecord_sna_leased_contract_no", columnLabel: "Leased Contract No.", keyName: "leasedContractNo" },
                { columnName: "custrecord_sna_visible", columnLabel: "Visible", keyName: "visible" },
                { columnName: "custrecord32", columnLabel: "GPS Serial", keyName: "gpsSerial" },
                { columnName: "custrecordcustrecord_hul_gps_serial", columnLabel: "GPS Serial Number", keyName: "gpsSerialNumber" },
                { columnName: "custrecord_sna_transportation_status", columnLabel: "Transportation Status", keyName: "transportationStatus" },
                { columnName: "custrecord_sna_customer_no", columnLabel: "Customer No.", keyName: "customerNo" },
                { columnName: "custrecord_sna_customer_name", columnLabel: "Customer Name", keyName: "customerName" },
                { columnName: "custrecord_sna_contact", columnLabel: "Contact No.", keyName: "contact" },
                { columnName: "custrecord_sna_bill_to_customer_no", columnLabel: "Bill-to Customer No.", keyName: "billToCustomerNo" },
                { columnName: "custrecord_sna_bill_to_name", columnLabel: "Bill-to Name", keyName: "billToCame" },
                { columnName: "custrecord_sna_next_pm_date", columnLabel: "Next PM Date", keyName: "nextPmDate" },
                { columnName: "custrecord_sna_next_inspection_date", columnLabel: "Next Inspection Date", keyName: "nextInspectionDate" },
                { columnName: "custrecord_sna_next_pm_hours", columnLabel: "Next PM Hours", keyName: "nextPmHours" },
                { columnName: "custrecord_sna_next_inspection_hours", columnLabel: "Next Inspection Hours", keyName: "nextInspectionHours" },
                { columnName: "custrecord_sna_last_pm_date", columnLabel: "Last PM Date", keyName: "lastPmDate" },
                { columnName: "custrecord_sna_last_pm_hours", columnLabel: "Last PM Hours", keyName: "lastPmHours" },
                { columnName: "custrecord_sna_last_inspection_hours", columnLabel: "Last Inspection Hours", keyName: "lastInspectionHours" },
                { columnName: "custrecord_sna_last_pm_action", columnLabel: "Last PM Action", keyName: "last_pm_action" },
                { columnName: "custrecord_sna_last_inspection_action", columnLabel: "Last Inspection Action", keyName: "lastInspectionAction" },
                { columnName: "custrecord_sna_contract_finish_date", columnLabel: "Contract Finish Date", keyName: "contractFinishDate" },
                { columnName: "custrecord_sna_last_pm_contact_user", columnLabel: "Last PM Contact User", keyName: "lastPmContactUser" },
                { columnName: "custrecord_sna_pm_action", columnLabel: "Next PM Action", keyName: "pmAction" },
                { columnName: "custrecord_sna_next_inspection_action", columnLabel: "Next Inspection Action", keyName: "nextInspectionAction" },
                { columnName: "custrecord_sna_contract_type", columnLabel: "Contract Type", keyName: "contractType" },
                { columnName: "custrecord_sna_preferred_resource_no", columnLabel: "Preferred Resource No.", keyName: "preferredResourceNo" },
                { columnName: "custrecord_sna_planned_service", columnLabel: "Planned Service", keyName: "plannedService" },
                { columnName: "custrecord_sna_availability", columnLabel: "Availability", keyName: "availability" },
                { columnName: "custrecord_sna_rental_income", columnLabel: "Rental Income", keyName: "rentalIncome" },
                { columnName: "custrecord_sna_cost", columnLabel: "Cost", keyName: "cost" },
                { columnName: "custrecord_sna_expected_cost", columnLabel: "Expected Cost", keyName: "expectedCost" },
                { columnName: "custrecord_sna_total_purchase", columnLabel: "Total Purchase", keyName: "totalPurchase" },
                { columnName: "custrecord_sna_purchase", columnLabel: "Purchase", keyName: "purchase" },
                { columnName: "custrecord_sna_enhancements", columnLabel: "Enhancements", keyName: "enhancements" },
                { columnName: "custrecord_sna_presales_cost", columnLabel: "Presales Cost", keyName: "presalesCost" },
                { columnName: "custrecord_sna_delivery", columnLabel: "Delivery", keyName: "delivery" },
                { columnName: "custrecord_sna_after_sales_cost", columnLabel: "After Sales Cost", keyName: "afterSalesCost" },
                { columnName: "custrecord_sna_over_allowance", columnLabel: "Over Allowance", keyName: "overAllowance" },
                { columnName: "custrecord_sna_depreciation", columnLabel: "Depreciation", keyName: "depreciation" },
                { columnName: "custrecord_sna_adjustments", columnLabel: "Adjustments", keyName: "adjustments" },
                { columnName: "custrecord_sna_fiscal_depreciation", columnLabel: "Fiscal Depreciation", keyName: "fiscalDepreciation" },
                { columnName: "custrecord_sna_fiscal_adjustments", columnLabel: "Fiscal Adjustments", keyName: "fiscalAdjustments" },
                { columnName: "custrecord_sna_book3_depreciation", columnLabel: "Book3 Depreciation", keyName: "book3Depreciation" },
                { columnName: "custrecord_sna_book3_depreciation_deact", columnLabel: "Book3 Depreciation Deact.", keyName: "book3DepreciationDeact" },
                { columnName: "custrecord_sna_sale", columnLabel: "Sale", keyName: "sale" },
                { columnName: "custrecord_sna_deactivation_purchase", columnLabel: "Deactivation Purchase", keyName: "deactivationPurchase" },
                { columnName: "custrecord_sna_deactivation_depreciation", columnLabel: "Deactivation Depreciation", keyName: "deactivationDepreciation" },
                { columnName: "custrecord_sna_eactivation_presales_cost", columnLabel: "Deactivation Presales Cost", keyName: "eactivationPresalesCost" },
                { columnName: "custrecord_sna_deactivation_fiscal_depre", columnLabel: "Deactivation Fiscal Depreciation", keyName: "deactivationFiscalDepre" },
                { columnName: "custrecord_sna_sales_claims", columnLabel: "Sales Claims", keyName: "salesClaims" },
                { columnName: "custrecord_sna_overtime_bill_main_contr", columnLabel: "Overtime Billing Maint. Contr.", keyName: "overtimeBillMainContr" },
                { columnName: "custrecord_sna_rental_contract_overtime", columnLabel: "Rental Contract Overtime", keyName: "rentalContractOvertime" },
                { columnName: "custrecord_sna_maintenance_claims", columnLabel: "Maintenance Claims", keyName: "maintenanceClaims" },
                { columnName: "custrecord_sna_invoiced_maintenance_cont", columnLabel: "Invoiced Maintenance Contracts", keyName: "invoicedMaintenanceCont" },
                { columnName: "custrecord_sna_maintenance_recognized_sa", columnLabel: "Maintenance Recognized Sales", keyName: "maintenanceRecognizedSa" },
                { columnName: "custrecord_sna_work_order_usage", columnLabel: "Work Order Usage", keyName: "workOrderUsage" },
                { columnName: "custrecord_sna_deactivation_wo_usage", columnLabel: "Deactivation Work Order Usage", keyName: "deactivationWoUsage" },
                { columnName: "custrecord_sna_open_transfers", columnLabel: "Open Transfers", keyName: "openTransfers" },
                { columnName: "custrecord_sna_alllocated_to_work_order", columnLabel: "Allocated to Work Order", keyName: "allocatedToWorkOrder" },
                { columnName: "custrecord_sna_work_order_sales", columnLabel: "Work Order Sales", keyName: "workorderSales" },
                { columnName: "custrecord_sna_leased_sales_revenue", columnLabel: "Leased Sales Revenue", keyName: "leasedSalesRevenue" },
                { columnName: "custrecord_sna_leased_cost", columnLabel: "Leased Cost", keyName: "leasedCost" },
                { columnName: "custrecord_sna_leased_wo_cost", columnLabel: "Leased WO Cost", keyName: "leasedWoCost" },
                { columnName: "custrecord_sna_remaining_interest", columnLabel: "Remaining Interest", keyName: "remainingInterest" },
                { columnName: "custrecord_sna_remaining_amount", columnLabel: "Remaining Amount", keyName: "remainingAmount" },
                { columnName: "custrecord_sna_posted_interest", columnLabel: "Posted Interest", keyName: "postedInterest" },
                { columnName: "custrecord_sna_posted_principal", columnLabel: "Posted Principal", keyName: "postedPrincipal" },
                { columnName: "cseg_sna_hul_eq_seg", columnLabel: "Equipment Posting/Category/Group", keyName: "equipmentPosting" },
                { columnName: "custrecord_sna_accessories", columnLabel: "Accessories", keyName: "accessories" },
                { columnName: "custrecord_sna_acq_date", columnLabel: "Acquisition Date", keyName: "acquisitionDate" },
                { columnName: "custrecord_sna_alternator", columnLabel: "Alternator", keyName: "alternator" },
                { columnName: "custrecord_sna_hul_asset_account", columnLabel: "Asset Account", keyName: "hulAssetAccount" },
                { columnName: "custrecord_sna_asset_type", columnLabel: "Asset Type", keyName: "assetType" },
                { columnName: "custrecord_sna_asset_value", columnLabel: "Asset Value", keyName: "assetValue" },
                { columnName: "custrecord_sna_attachments", columnLabel: "Attachments", keyName: "attachments" },
                { columnName: "custrecord_sna_axle_on_rail_serial", columnLabel: "Axle (on rail) Serial", keyName: "axleOnRailSerial" },
                { columnName: "custrecord_sna_axle_on_road_serial", columnLabel: "Axle (on road) Serial", keyName: "axleOnRoadSerial" },
                { columnName: "custrecord_sna_axle_model", columnLabel: "Axle Model", keyName: "axleModel" },
                { columnName: "custrecord_sna_axle_serial", columnLabel: "Axle Serial", keyName: "axleSerial" },
                { columnName: "custrecord_sna_battery_comp_size_max", columnLabel: "Battery Compartment Size, Maximum", keyName: "batteryCompSizeMax" },
                { columnName: "custrecord_sna_battery_quantity", columnLabel: "Battery Quantity", keyName: "batteryQuantity" },
                { columnName: "custrecord_sna_battery_type", columnLabel: "Battery Type", keyName: "batteryType" },
                { columnName: "custrecord_sna_battery_weight_maximum", columnLabel: "Battery Weight, Maximum", keyName: "batteryWeightMaximum" },
                { columnName: "custrecord_sna_battery_weight_minimum", columnLabel: "Battery Weight, Minimum", keyName: "batteryWeightMinimum" },
                { columnName: "custrecord_sna_blocked", columnLabel: "Blocked", keyName: "blocked" },
                { columnName: "custrecord_sna_bv_adj_acct", columnLabel: "Book Value Adjustment Account", keyName: "bookvalueAdjAccount" },
                { columnName: "custrecord_sna_bv_setting_sales_price", columnLabel: "Bookvalue on Setting Sales Price", keyName: "bookvvalueSettingSalesPrice" },
                { columnName: "custrecord_sna_cab_options", columnLabel: "CAB Options", keyName: "cabOptions" },
                { columnName: "custrecord_sna_cab_style", columnLabel: "CAB Style", keyName: "cabStyle" },
                { columnName: "custrecord_sna_hul_cogs_account", columnLabel: "COGS Account", keyName: "hulCogsAccount" },
                { columnName: "custrecord_sna_capacity_new", columnLabel: "Capacity", keyName: "capacityNew" },
                { columnName: "custrecord_sna_clearance_on_rail", columnLabel: "Clearance (on rail)", keyName: "clearanceOnRail" },
                { columnName: "custrecord_sna_clearance_on_road", columnLabel: "Clearance (on road)", keyName: "clearanceOnRoad" },
                { columnName: "custrecord_sna_hul_obj_commissionable_bv", columnLabel: "Commissionable Book Value", keyName: "objCommissionableBookvalue" },
                { columnName: "custrecord_sna_config_notes", columnLabel: "Configuration Notes", keyName: "configNotes" },
                { columnName: "custrecord_sna_current_address", columnLabel: "Current Address", keyName: "currentAddress" },
                { columnName: "custrecord_sna_current_address_2", columnLabel: "Current Address 2", keyName: "currentAddress2" },
                { columnName: "custrecord_sna_current_city", columnLabel: "Current City", keyName: "currentCity" },
                { columnName: "custrecord_sna_current_code", columnLabel: "Current Code", keyName: "currentCode" },
                { columnName: "custrecord_sna_current_country_code", columnLabel: "Current Country Code", keyName: "currentCountryCode" },
                { columnName: "custrecord_sna_current_email", columnLabel: "Current E-mail", keyName: "currentEmail" },
                { columnName: "custrecord_sna_current_fax_no", columnLabel: "Current Fax No.", keyName: "currentFaxNo" },
                { columnName: "custrecord_sna_current_name", columnLabel: "Current Name", keyName: "currentName" },
                { columnName: "custrecord_sna_current_object_loc", columnLabel: "Current Object Location", keyName: "currentObjectLocation" },
                { columnName: "custrecord_sna_current_phone_no", columnLabel: "Current Phone No.", keyName: "currentPhoneNo" },
                { columnName: "custrecord_sna_current_post_code", columnLabel: "Current Post Code", keyName: "currentPostCode" },
                { columnName: "custrecord_sna_hul_cust_eq_no", columnLabel: "Customer Equipment No", keyName: "customerEquipmentNo" },
                { columnName: "custrecord_hul_customerorder", columnLabel: "Customer Order", keyName: "customerOrder" },
                { columnName: "created", columnLabel: "Date Created", keyName: "dateCreated" },
                { columnName: "custrecord_sna_default_rental_return_loc", columnLabel: "Default Rental Return Location", keyName: "defaultRentalReturnLocation" },
                { columnName: "custrecord_sna_depreciation_cost_code", columnLabel: "Depreciation Cost Code", keyName: "depreciationCostCode" },
                { columnName: "custrecord_sna_dep_start_date", columnLabel: "Depreciation Starting Date", keyName: "depreciationStartDate" },
                { columnName: "custrecord_sna_description", columnLabel: "Description", keyName: "description" },
                { columnName: "custrecord_sna_diesel_engine", columnLabel: "Diesel Engine", keyName: "dieselEngine" },
                { columnName: "custrecord_sna_digital_instrumentation", columnLabel: "Digital Instrumentation", keyName: "digitalInstrumentation" },
                { columnName: "displaynametranslated", columnLabel: "Display Name (Translated)", keyName: "displayNameTranslated" },
                { columnName: "custrecord_sna_hul_rent_dummy", columnLabel: "Dummy", keyName: "hulRentDummy" },
                { columnName: "custrecord_sna_batt_replaced", columnLabel: "Dysel - Batt Replaced", keyName: "batteryReplaced" },
                { columnName: "custrecord_sna_battery_charger_no", columnLabel: "Dysel - Battery-Charger No.s", keyName: "batteryChargerno" },
                { columnName: "custrecord_sna_capacity", columnLabel: "Dysel - Capacity", keyName: "capacity" },
                { columnName: "custrecord_sna_conv_hour_meter", columnLabel: "Dysel - Conv Hour Meter", keyName: "convHourMeter" },
                { columnName: "custrecord_sna_eng_code", columnLabel: "Dysel - Eng Code", keyName: "engCode" },
                { columnName: "custrecord_sna_eng_make", columnLabel: "Dysel - Eng Make", keyName: "engMake" },
                { columnName: "custrecord_sna_eng_model", columnLabel: "Dysel - Eng Model", keyName: "engModel" },
                { columnName: "custrecord_sna_eng_serial", columnLabel: "Dysel - Eng Serial", keyName: "engSerial" },
                { columnName: "custrecord_sna_eng_type", columnLabel: "Dysel - Eng Type", keyName: "engType" },
                { columnName: "custrecord_sna_eng_warranty", columnLabel: "Dysel - Eng Warranty", keyName: "engWarranty" },
                { columnName: "custrecord_sna_eng_year", columnLabel: "Dysel - Eng Year", keyName: "engYear" },
                { columnName: "custrecord_sna_forks", columnLabel: "Dysel - Forks", keyName: "forks" },
                { columnName: "custrecord_sna_frame_no2", columnLabel: "Dysel - Frame No", keyName: "frameNo2" },
                { columnName: "custrecord_sna_frame_no", columnLabel: "Dysel - Frame No.", keyName: "frameNo" },
                { columnName: "custrecord_sna_fuel_kit_no", columnLabel: "Dysel - Fuel Kit No", keyName: "fuelKitno" },
                { columnName: "custrecord_sna_gps_asset_tag", columnLabel: "Dysel - GPS Asset Tag", keyName: "gpsAssetTag" },
                { columnName: "custrecord_sna_height", columnLabel: "Dysel - Height", keyName: "height" },
                { columnName: "custrecord_sna_pm_type", columnLabel: "Dysel - PM Type", keyName: "pmType" },
                { columnName: "custrecord_sna_part_no_attach", columnLabel: "Dysel - Part No Attachments", keyName: "partnoAttach" },
                { columnName: "custrecord_sna_part_no_tires", columnLabel: "Dysel - Part No Tires", keyName: "partnoTires" },
                { columnName: "custrecord_sna_part_no_mast_chain", columnLabel: "Dysel - Part No.s Mast-Chain", keyName: "partnoMastChain" },
                { columnName: "custrecord_sna_power", columnLabel: "Dysel - Power", keyName: "power" },
                { columnName: "custrecord_sna_tires", columnLabel: "Dysel - Tires", keyName: "tires" },
                { columnName: "custrecord_sna_transmission", columnLabel: "Dysel - Transmission", keyName: "transmission" },
                { columnName: "custrecord_sna_warranty_type", columnLabel: "Dysel - Warranty Type", keyName: "warrantyType" },
                { columnName: "custrecord_sna_empty_with_min_weight", columnLabel: "Empty with Minimum Weight Battery", keyName: "emptyWithMinWeight" },
                { columnName: "custrecord_sna_engine_make", columnLabel: "Engine Make", keyName: "engineMake" },
                { columnName: "custrecord_sna_engine_model", columnLabel: "Engine Model", keyName: "engineModel" },
                { columnName: "custrecord_sna_engine_serial", columnLabel: "Engine Serial", keyName: "engineSerial" },
                { columnName: "custrecord_sna_entry_door_type", columnLabel: "Entry Door Type", keyName: "entryDoorType" },
                { columnName: "custrecord_sna_equipment_category", columnLabel: "Equipment Category", keyName: "equipmentCategory" },
                { columnName: "custrecord_sna_equipment_group", columnLabel: "Equipment Group", keyName: "equipmentGroup" },
                { columnName: "custrecord_sna_equipment_model", columnLabel: "Equipment Model", keyName: "equipmentModel" },
                { columnName: "custrecord_sna_equipment_posting_group", columnLabel: "Equipment Posting Group", keyName: "equipmentPostingGroup" },
                { columnName: "custrecord_sna_status", columnLabel: "Equipment Status", keyName: "status" },
                { columnName: "custrecord_sna_equipment_sub_model", columnLabel: "Equipment Sub Model", keyName: "equipmentSubModel" },
                { columnName: "custrecord_sna_expected_delivery_date", columnLabel: "Expected Delivery Date", keyName: "expectedDeliveryDate" },
                { columnName: "custrecord_sna_expected_receipt_date", columnLabel: "Expected Receipt Date", keyName: "expectedReceiptDate" },
                { columnName: "custrecord_sna_exp_rental_return_date", columnLabel: "Expected Rental Return Date", keyName: "expectedRentalReturnDate" },
                { columnName: "custrecord_sna_expected_rep_date", columnLabel: "Expected Replacement Date", keyName: "expectedReplacementDate" },
                { columnName: "custrecord_sna_expected_rep_value", columnLabel: "Expected Replacement Value", keyName: "expectedReplacementValue" },
                { columnName: "custrecord_sna_extension_deck_roll_out", columnLabel: "Extension Deck (Roll Out)", keyName: "extensionDeckRollout" },
                { columnName: "externalid", columnLabel: "External ID", keyName: "externalId" },
                { columnName: "custrecord_sna_fixed_asset", columnLabel: "Fixed Asset", keyName: "fixedAsset" },
                { columnName: "custrecord_sna_fork_dime_thick_wid_lengt", columnLabel: "Fork Dimensions (Thickness x Width x Length)", keyName: "forkDimThickWidthLength" },
                { columnName: "custrecord_sna_fork_carriage_to_din_15_1", columnLabel: "Fork carriage to DIN 15 173 A / B / no", keyName: "forkCarriageTo_din_15_1" },
                { columnName: "custrecord_sna_forks_new", columnLabel: "Forks", keyName: "forksNew" },
                { columnName: "custrecord_sna_free_lift", columnLabel: "Free Lift", keyName: "freeLift" },
                { columnName: "custrecord_sna_fuel_tank", columnLabel: "Fuel Tank", keyName: "fuelTank" },
                { columnName: "custrecord_sna_fuel_tank_size", columnLabel: "Fuel Tank Size", keyName: "fuelTankSize" },
                { columnName: "custrecord_sna_hul_gain_loss_account", columnLabel: "Gain/Loss Account", keyName: "hulGainLossAccount" },
                { columnName: "custrecord_sna_gradeability", columnLabel: "Gradeability", keyName: "gradeability" },
                { columnName: "custrecord_sna_ground_clearance", columnLabel: "Ground Clearance", keyName: "groundClearance" },
                { columnName: "custrecord_sna_ground_clearance_raised", columnLabel: "Ground Clearance (raised)", keyName: "groundClearanceRaised" },
                // { columnName: "cseg_hul_mfg", columnLabel: "HUL Manufacturer (2)", keyName: "hulMfg" },
                { columnName: "custrecord_sna_hul_segment", columnLabel: "HUL Segment", keyName: "segment" },
                { columnName: "custrecord_sna_height_on_rail", columnLabel: "Height (on rail)", keyName: "heightOnRail" },
                { columnName: "custrecord_sna_height_on_road", columnLabel: "Height (on road)", keyName: "heightOnRoad" },
                { columnName: "custrecord_sna_height_to_top_of_overhead", columnLabel: "Height to Top of Overhead Guard", keyName: "heightToTopOfOverhead" },
                { columnName: "custrecord_sna_horizontal_reach", columnLabel: "Horizontal Reach", keyName: "horizontalReach" },
                { columnName: "custrecord_sna_hydraulic_reservoir", columnLabel: "Hydraulic Reservoir", keyName: "hydraulicReservoir" },
                { columnName: "isinactive", columnLabel: "Inactive", keyName: "isInactive" },
                { columnName: "custrecord_sna_hul_income_account", columnLabel: "Income Account", keyName: "hulIncomeAccount" },
                { columnName: "custrecord_sna_installed_options", columnLabel: "Installed Options", keyName: "installedOptions" },
                { columnName: "internalid", columnLabel: "Internal ID", keyName: "internalid" },
                { columnName: "custrecord_sna_hul_inventory_object", columnLabel: "Inventory", keyName: "inventoryObject" },
                { columnName: "custrecord_sna_jlg_e400", columnLabel: "JLG E400", keyName: "jlg_e400" },
                { columnName: "custrecord_sna_jib_length", columnLabel: "Jib Length", keyName: "jibLength" },
                { columnName: "custrecord_sna_joystick_configuration", columnLabel: "Joystick Configuration", keyName: "joystickConfiguration" },
                { columnName: "language", columnLabel: "Language", keyName: "language" },
                { columnName: "custrecord_sna_last_inspection_date", columnLabel: "Last Inspection Date", keyName: "lastInspectionDate" },
                { columnName: "custrecord_sna_last_meter_reading_m1", columnLabel: "Last Meter Reading M1", keyName: "lastMeterReadingM1" },
                { columnName: "custrecord_sna_last_meter_reading_m2", columnLabel: "Last Meter Reading M2", keyName: "lastMeterReadingM2" },
                { columnName: "lastmodified", columnLabel: "Last Modified", keyName: "lastModified" },
                { columnName: "lastmodifiedby", columnLabel: "Last Modified By", keyName: "lastModifiedBy" },
                { columnName: "custrecord_sna_latitude", columnLabel: "Latitude", keyName: "latitude" },
                { columnName: "custrecord_sna_hul_lease_co_code", columnLabel: "Lease Co Code", keyName: "hulLeaseCoCode" },
                { columnName: "custrecord_sna_lease_company_id", columnLabel: "Lease Company ID", keyName: "leaseCompanyId" },
                { columnName: "custrecord_sna_length_to_fork_face", columnLabel: "Length to Fork Face (Includes Fork Thickness)", keyName: "lengthToForkFace" },
                { columnName: "custrecord_sna_load_center", columnLabel: "Load Center - Distance", keyName: "loadCenter" },
                { columnName: "custrecord_sna_load_dis_axle_to_fork_fac", columnLabel: "Load Distance, Axle to Fork Face", keyName: "loadDistanceAxleToForkFace" },
                { columnName: "custrecord_sna_longitude", columnLabel: "Longitude", keyName: "longitude" },
                { columnName: "custrecord_sna_lowered_platform_height", columnLabel: "Lowered Platform Height", keyName: "loweredPlatformHeight" },
                { columnName: "custrecord_sna_m2", columnLabel: "M2", keyName: "meterKeyM2" },
                { columnName: "custrecord_sna_man_code", columnLabel: "Manufacturer Code", keyName: "manufacturerCode" },
                { columnName: "custrecord_sna_mast_cylinder_numbers", columnLabel: "Mast Cylinder Numbers", keyName: "mastCylinderNumbers" },
                { columnName: "custrecord_sna_mast_model_number", columnLabel: "Mast Model Number", keyName: "mastModelNumber" },
                { columnName: "custrecord_sna_mast_serial_number", columnLabel: "Mast Serial Number", keyName: "mastSerialNumber" },
                { columnName: "custrecord_sna_mast_mbr_style", columnLabel: "Mast/LBR Style", keyName: "mastMbrStyle" },
                { columnName: "custrecord_sna_max_no_of_persons", columnLabel: "Maximum # of Persons", keyName: "maxNoOfPersons" },
                { columnName: "custrecord_sna_maximum_drive_height", columnLabel: "Maximum Drive Height", keyName: "maximumDriveHeight" },
                { columnName: "custrecord_sna_maximum_fork_height", columnLabel: "Maximum Fork Height", keyName: "maximumForkHeight" },
                { columnName: "custrecord_sna_max_forward_reach", columnLabel: "Maximum Forward Reach", keyName: "maxForwardReach" },
                { columnName: "custrecord_sna_max_lift_capacity", columnLabel: "Maximum Lift Capacity", keyName: "maxLiftCapacity" },
                { columnName: "custrecord_sna_max_lift_height", columnLabel: "Maximum Lift Height", keyName: "maxLiftHeight" },
                { columnName: "custrecord_sna_min_aisle_90_stack", columnLabel: "Minimum Aisle – 90° Stack – Zero Clearance without Load", keyName: "minAisle_90_stack" },
                { columnName: "custrecord_sna_mitsubishi_fb16pnt_fb20pn", columnLabel: "Mitsubishi FB16PNT-FB20PNT", keyName: "mitsubishi_fb16pnt_fb20pn" },
                { columnName: "custrecord_sna_nifty_sd64", columnLabel: "NIFTY SD64", keyName: "nifty_sd64" },
                { columnName: "custrecord_sna_nifty_tm42t", columnLabel: "NIFTY TM42T", keyName: "nifty_tm42t" },
                { columnName: "custrecord_hul_nxcequipasset", columnLabel: "NXC Equipment Asset", keyName: "nxcEquipAsset" },
                { columnName: "custrecord_sna_new_bv", columnLabel: "New Book Value", keyName: "newBookvalue" },
                { columnName: "custrecord_sna_new_rental_contract_no", columnLabel: "New Rental Contract No.", keyName: "newRentalContractNo" },
                { columnName: "custrecord_sna_no_fleet_code", columnLabel: "No + Fleet Code (H)", keyName: "noFleetCode" },
                { columnName: "custrecord_sna_no", columnLabel: "No.", keyName: "no" },
                { columnName: "custrecord_sna_not_for_sales", columnLabel: "Not for Sale", keyName: "notForSales" },
                { columnName: "custrecord_sna_oa_length_less_forks", columnLabel: "O/A Length - Less Forks", keyName: "oaLengthLessForks" },
                { columnName: "custrecord_sna_operating_weight", columnLabel: "Operating Weight", keyName: "operatingWeight" },
                { columnName: "custrecord_sna_hul_original_cost", columnLabel: "Original Cost", keyName: "hulOriginalCost" },
                { columnName: "custrecord_sna_dev", columnLabel: "Original Cost Test Dev", keyName: "dev" },
                { columnName: "custrecord_sna_overall_chassis_width", columnLabel: "Overall Chassis Width", keyName: "overallChassisWidth" },
                { columnName: "custrecord_sna_overall_height_stowed", columnLabel: "Overall Height - Stowed", keyName: "overallHeightStowed" },
                { columnName: "custrecord_sna_overall_height_w_mast_rai", columnLabel: "Overall Height with Mast Raised", keyName: "overallHeightWMastRai" },
                { columnName: "custrecord_sna_overall_length", columnLabel: "Overall Length", keyName: "overallLength" },
                { columnName: "custrecord_sna_overall_lowered_height", columnLabel: "Overall Lowered Height (Mast)", keyName: "overallLoweredHeight" },
                { columnName: "custrecord_sna_overall_width", columnLabel: "Overall Width", keyName: "overallWidth" },
                { columnName: "custrecord_sna_owning_loc_code", columnLabel: "Owning Location Code", keyName: "owningLocationCode" },
                { columnName: "custrecord_sna_picture", columnLabel: "Picture", keyName: "picture" },
                { columnName: "custrecord_sna_platform_height", columnLabel: "Platform Height", keyName: "platformHeight" },
                { columnName: "custrecord_sna_platform_length_inside_di", columnLabel: "Platform Length (Inside Dimension)", keyName: "platformLengthInsideDim" },
                { columnName: "custrecord_sna_platform_size", columnLabel: "Platform Size", keyName: "platformSize" },
                { columnName: "custrecord_sna_platform_width_inside_dim", columnLabel: "Platform Width (Inside Dimension)", keyName: "platformWidthInsideDim" },
                { columnName: "custrecord_sna_posting_status", columnLabel: "Posting Status", keyName: "postingStatus" },
                { columnName: "custrecord_sna_power_new", columnLabel: "Power", keyName: "powerNew" },
                { columnName: "custrecord_sna_prior_posting_status", columnLabel: "Prior Posting Status", keyName: "priorPostingStatus" },
                { columnName: "custrecord_sna_production_date", columnLabel: "Production Date", keyName: "productionDate" },
                { columnName: "custrecord_sna_purchase_date", columnLabel: "Purchase Date", keyName: "purchaseDate" },
                { columnName: "custrecord_sna_purchase_order", columnLabel: "Purchase Order", keyName: "purchaseOrder" },
                { columnName: "custrecord_sna_raised_platform_height", columnLabel: "Raised Platform Height", keyName: "raisedPlatformHeight" },
                { columnName: "custrecord_sna_rental_contract_no", columnLabel: "Rental Contract No.", keyName: "rentalContractNo" },
                { columnName: "custrecord_sna_rental_contract_no_so", columnLabel: "Rental Contract No. (Sales Order)", keyName: "rentalContractNoSo" },
                { columnName: "custrecord_sna_rental_contract_sec_date", columnLabel: "Rental Contract Secured Date", keyName: "rentalContractSecDate" },
                { columnName: "custrecord_sna_rental_status", columnLabel: "Rental Status", keyName: "rentalStatus" },
                { columnName: "custrecord_sna_rerent_end_date", columnLabel: "Rerent End Date", keyName: "rerentEndDate" },
                { columnName: "custrecord_sna_rerent_vendor_return_no", columnLabel: "Rerent Vendor Return No", keyName: "rerentVendorReturnNo" },
                { columnName: "custrecord_sna_responsibility_center", columnLabel: "Responsibility Center", keyName: "responsibilityCenter" },
                { columnName: "custrecord_sna_hul_segment_grouping", columnLabel: "SNA - Eq Posting : Category : Group", keyName: "segmentGrouping" },
                { columnName: "custrecord_sna_sales_price", columnLabel: "Sales Price", keyName: "salesPrice" },
                { columnName: "custrecord_sna_sales_price_adj", columnLabel: "Sales Price Adjustment", keyName: "salesPriceAdj" },
                { columnName: "custrecord_sna_serial_no", columnLabel: "Serial No.", keyName: "serialNo" },
                { columnName: "custrecord_sna_skyjack_1056th", columnLabel: "Skyjack 1056TH", keyName: "skyjack_1056th" },
                { columnName: "custrecord_sna_skyjack_3219", columnLabel: "Skyjack 3219", keyName: "skyjack_3219" },
                { columnName: "custrecord_sna_skyjack_60aj", columnLabel: "Skyjack 60AJ+", keyName: "skyjack_60aj" },
                { columnName: "custrecord_sna_skyjack_60t", columnLabel: "Skyjack 60T", keyName: "skyjack_60t" },
                { columnName: "custrecord_sna_stowed_height", columnLabel: "Stowed Height", keyName: "stowedHeight" },
                { columnName: "custrecord_sna_stowed_height_rails_down", columnLabel: "Stowed Height (Rails Down)", keyName: "stowedHeightRailsDown" },
                { columnName: "custrecord_sna_stowed_height_rails_up", columnLabel: "Stowed Height (Rails Up)", keyName: "stowedHeightRailsUp" },
                { columnName: "custrecord_sna_stowed_length", columnLabel: "Stowed Length", keyName: "stowedLength" },
                { columnName: "custrecord_sna_stowed_width", columnLabel: "Stowed Width", keyName: "stowedWidth" },
                { columnName: "custrecord_sna_tax_group_code", columnLabel: "Tax Group Code", keyName: "taxGroupCode" },
                { columnName: "custrecord_sna_tilt_forward_backward", columnLabel: "Tilt Forward/Backward", keyName: "tiltForwardBackward" },
                { columnName: "custrecord_sna_tire_size", columnLabel: "Tire Size", keyName: "tireSize" },
                { columnName: "custrecord_sna_tire_size_drive", columnLabel: "Tire Size, Drive", keyName: "tireSizeDrive" },
                { columnName: "custrecord_sna_tire_size_steer", columnLabel: "Tire Size, Steer", keyName: "tireSizeSteer" },
                { columnName: "custrecord_sna_tire_type", columnLabel: "Tire Type", keyName: "tireType" },
                { columnName: "custrecord_sna_tires_new", columnLabel: "Tires", keyName: "tiresNew" },
                { columnName: "custrecord_sna_tires_wheels_on_rail", columnLabel: "Tires/Wheels (on rail)", keyName: "tiresWheelsOnRail" },
                { columnName: "custrecord_sna_tires_wheels_on_rail_qty", columnLabel: "Tires/Wheels (on rail) Quantity", keyName: "tiresWheelsOnRailQty" },
                { columnName: "custrecord_sna_tires_wheels_on_road", columnLabel: "Tires/Wheels (on road)", keyName: "tiresWheelsOnRoad" },
                { columnName: "custrecord_sna_tires_wheels_on_road_qty", columnLabel: "Tires/Wheels (on road) Quantity", keyName: "tiresWheelsOnRoadQty" },
                { columnName: "custrecord_sna_trackmobile_titan_railcar", columnLabel: "Trackmobile Titan Railcar mover", keyName: "trackmobileTitanRailcar" },
                { columnName: "custrecord_sna_train_air_compressors", columnLabel: "Train Air Compressors", keyName: "trainAirCompressors" },
                { columnName: "custrecord_sna_transmission_make", columnLabel: "Transmission Make", keyName: "transmissionMake" },
                { columnName: "custrecord_sna_transmission_model", columnLabel: "Transmission Model", keyName: "transmissionModel" },
                { columnName: "custrecord_sna_transmission_serial", columnLabel: "Transmission Serial", keyName: "transmissionSerial" },
                { columnName: "custrecord_sna_transportation_height", columnLabel: "Transportation Height", keyName: "transportationHeight" },
                { columnName: "custrecord_sna_transportation_length", columnLabel: "Transportation Length", keyName: "transportationLength" },
                { columnName: "custrecord_sna_turning_radius_outside", columnLabel: "Turning Radius (Outside)", keyName: "turningRadiusOutside" },
                { columnName: "custrecord_sna_vendor_no", columnLabel: "Vendor No.", keyName: "vendorNo" },
                { columnName: "custrecord_sna_vendor_order_no", columnLabel: "Vendor Order No.", keyName: "vendorOrderNo" },
                { columnName: "custrecord_sna_vendor_position_no", columnLabel: "Vendor Position No.", keyName: "vendorPositionNo" },
                { columnName: "custrecord_sna_warranty_period", columnLabel: "Warranty Period", keyName: "warrantyPeriod" },
                { columnName: "custrecord_sna_warranty_period_engine", columnLabel: "Warranty Period Engine", keyName: "warrantyPeriodEngine" },
                { columnName: "custrecord_sna_warranty_period_source", columnLabel: "Warranty Period Source", keyName: "warrantyPeriodSource" },
                { columnName: "custrecord_sna_warranty_period_source_en", columnLabel: "Warranty Period Source Engine", keyName: "warrantyPeriodSourceEngine" },
                { columnName: "custrecord_sna_weight", columnLabel: "Weight", keyName: "weight" },
                { columnName: "custrecord_sna_wheelbase", columnLabel: "Wheelbase", keyName: "wheelbase" },
                { columnName: "custrecord_sna_wheelbase_on_rail", columnLabel: "Wheelbase (on rail)", keyName: "wheelbaseOnRail" },
                { columnName: "custrecord_sna_wheelbase_on_road", columnLabel: "Wheelbase (on road)", keyName: "wheelbaseOnRoad" },
                { columnName: "custrecord_sna_wheels_no_front_rear", columnLabel: "Wheels, number front / rear (x=driven)", keyName: "wheelsnoFrontRear" },
                { columnName: "custrecord_sna_wind_rating", columnLabel: "Wind Rating", keyName: "windRating" },
                { columnName: "custrecord_sna_work_height", columnLabel: "Work Height", keyName: "workHeight" },
                { columnName: "custrecord_sna_aisle_width_800_1200", columnLabel: "Working Aisle Width with 800 x 1,200 mm Pallets, Crosswise", keyName: "aisleWidth_800_1200" },
                { columnName: "custrecord_sna_aisle_width_1000_1200", columnLabel: "Working Aisle width with 1,000 x 1,200 mm Pallets, Crosswise", keyName: "aisleWidth_1000_1200" },
                { columnName: "custrecord_sna_working_width_w_outrigger", columnLabel: "Working Width (w/outriggers)", keyName: "workingWidthWOTrigger" },
                { columnName: "custrecord_sna_year", columnLabel: "Year", keyName: "year" }
            ];

            let columns = [];

            columnsArray.forEach(element => {
                columns.push({name: element.columnName, label: element.columnLabel});
            })

            let searchObj = search.create({
                type: "customrecord_sna_objects",
                filters: [{name: "custrecordcustrecord_hul_gps_serial", operator: "is", values: gpsSerial}],
                columns
            }).run();//.each(result => {
            let results = getAllSearchResults(searchObj);
            results.forEach(result => {
                let responseObj = {};

                columns.forEach(element => {
                    let keyIndex = columnsArray.findIndex(x => x.columnName === element.name);
                    log.debug({title: "Key", details: {keyIndex, keyName: columnsArray[keyIndex]}});
                    responseObj[columnsArray[keyIndex].keyName] = result.getText({name: element.name}) || result.getValue({name: element.name});
                })

                response.push(responseObj);
                objects.push(result.id);
                return true;
            });

            if (objects.length > 0) {
                let hourMeters = getHourMeters(objects);

                for (let i = 0; i < response.length; i++) {
                    response[i].hourMeters = hourMeters.filter(element => element.objectId === response[i].internalid);
                }
            }

            return response;
        }

        const getHourMeters = (objects) => {
            let response = [];
            let columnsArray = [
                {columnName: "custrecord_sna_hul_object_ref", keyName:"objectRef", columnLabel:"Object"},
                {columnName: "custrecord_sna_hul_external_id", keyName:"externalId", columnLabel:"External ID"},
                {columnName: "custrecord_sna_hul_date", keyName:"date", columnLabel:"Date"},
                {columnName: "custrecord_sna_hul_time", keyName:"time", columnLabel:"Time"},
                {columnName: "custrecord_sna_hul_hour_meter_reading", keyName:"hourMeterReading", columnLabel:"Reading"},
                {columnName: "custrecord_sna_hul_ignore_in_calculation", keyName:"ignoreInCalculation", columnLabel:"Ignore in Calculation"},
                {columnName: "custrecord_sna_hul_hr_meter_source", keyName:"hourMeterSource", columnLabel:"Source"},
                {columnName: "custrecord_sna_hul_source_record", keyName:"sourceRecord", columnLabel:"Source No."},
                {columnName: "custrecord_sna_hul_actual_reading", keyName:"actualReading", columnLabel:"Actual Reading"},
                {columnName: "custrecord_sna_hul_meter_used", keyName:"meterUsed", columnLabel:"Meter"},
                {columnName: "id", keyName:"id", columnLabel:"ID"},
                {columnName: "internalid", keyName:"internalid", columnLabel:"Internal ID"},
                {columnName: "language", keyName:"language", columnLabel:"Language"}
            ];

            let columns = [];

            columnsArray.forEach(element => {
                columns.push({name: element.columnName, label: element.columnLabel});
            })

            let searchObj = search.create({
                type: "customrecord_sna_hul_hour_meter",
                filters: [{name: "custrecord_sna_hul_object_ref", operator: "anyof", values: objects}],
                columns
            }).run();//.each(result => {
            let results = getAllSearchResults(searchObj);
            results.forEach(result => {
                let responseObj = {
                    objectId: result.getValue({name: "custrecord_sna_hul_object_ref"})
                };

                columns.forEach(element => {
                    // let key = element.name.replace('custrecord_sna_', '');
                    let keyIndex = columnsArray.findIndex(x => x.columnName === element.name);
                    log.debug({title: "Key", details: {keyIndex, keyName: columnsArray[keyIndex]}});
                    responseObj[columnsArray[keyIndex].keyName] = result.getText({name: element.name}) || result.getValue({name: element.name});
                })

                response.push(responseObj);
                return true;
            });
            return response;
        }

        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {
            let response;
            let gpsSerial = requestParams.gpsSerial;

            log.debug({title: 'get requestParams', details: requestParams});

            switch (requestParams.type) {
                case "object":
                    response = getObjects(gpsSerial);
                    break;
                case "hourMeter":
                    response = getHourMeters(requestParams);
                    break;
            }
            return JSON.stringify(response);
        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {
            let response;
            switch (requestBody.type) {
                case "object":
                    response = processObject("PUT", requestBody);
                    break;
                case "hourMeter":
                    response = processHourMeter("PUT", requestBody);
                    break;
            }

            return response;
        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {
            let response;
            switch (requestBody.type) {
                case "object":
                    response = processObject("POST", requestBody);
                    break;
                case "hourMeter":
                    response = processHourMeter("POST", requestBody);
                    break;
            }

            return response;
        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {
            let response;
            switch (requestBody.type) {
                case "object":
                    try {
                        record.delete({type: "customrecord_sna_objects", id: requestParams.id});
                        response = {message: "Record has been deleted"};
                    } catch (error) {
                        response = {message: error};
                    }
                    break;
                case "hourMeter":
                    try {
                        record.delete({type: "customrecord_sna_hul_hour_meter", id: requestParams.id});
                        response = {message: "Record has been deleted"};
                    } catch (error) {
                        response = {message: error};
                    }
                    break;
            }

            return response;
        }

        return {get, put, post, delete: doDelete}

    });
