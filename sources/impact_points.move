module riscend_addr::wellness_pact {
    use std::signer;

    /// Only the Riscend Admin address is authorized to award points.
    const ENOT_AUTHORIZED: u64 = 1;

    struct ImpactStore has key {
        feeding_points: u64,
        housing_points: u64,
        business_points: u64
    }

    public entry fun initialize_impact_store(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<ImpactStore>(addr)) {
            move_to(
                account,
                ImpactStore { feeding_points: 0, housing_points: 0, business_points: 0 }
            );
        }
    }

    public entry fun award_points(
        admin: &signer,
        user_addr: address,
        amount: u64,
        category: u8
    ) acquires ImpactStore {
        assert!(signer::address_of(admin) == @riscend_addr, ENOT_AUTHORIZED);

        let store = borrow_global_mut<ImpactStore>(user_addr);

        if (category == 1) {
            store.feeding_points = store.feeding_points + amount;
        } else if (category == 2) {
            store.housing_points = store.housing_points + amount;
        } else if (category == 3) {
            store.business_points = store.business_points + amount;
        };
    }

    #[view]
    public fun get_points(user_addr: address): (u64, u64, u64) acquires ImpactStore {
        let store = borrow_global<ImpactStore>(user_addr);
        (store.feeding_points, store.housing_points, store.business_points)
    }

    #[test(admin = @riscend_addr)]
    public fun test_initialize_success(admin: signer) acquires ImpactStore {
        let admin_addr = signer::address_of(&admin);
        initialize_impact_store(&admin);
        let (feeding, _, _) = get_points(admin_addr);
        assert!(feeding == 0, 0);
    }

    #[test(admin = @riscend_addr, user = @0x456)]
    public fun test_award_points(admin: signer, user: signer) acquires ImpactStore {
        let user_addr = signer::address_of(&user);
        initialize_impact_store(&user);

        award_points(&admin, user_addr, 10, 1);

        let (feeding, _, _) = get_points(user_addr);
        assert!(feeding == 10, 0);
    }
}

