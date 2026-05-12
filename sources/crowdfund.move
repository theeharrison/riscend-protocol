module riscend_addr::crowdfund {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::vector;
    use aptos_std::table::{Self, Table};

    // --- CONSTANTS ---
    const VALIDATION_THRESHOLD: u64 = 1;
    const PLATFORM_FEE_PERCENT: u64 = 2;
    const EQUITY_SHARE_PERCENT: u64 = 7;

    const POINTS_PER_APT: u64 = 10;
    const FOUNDER_FINALIZATION_BONUS: u64 = 500;

    // --- ERROR CODES ---
    const ENOT_VALIDATED: u64 = 1;
    const EGOAL_NOT_MET: u64 = 2;
    const EALREADY_UPVOTED: u64 = 3;
    const ENOT_AUTHORIZED: u64 = 4;
    const EPROJECT_INACTIVE: u64 = 5;
    const EALREADY_REQUESTED: u64 = 6;
    const EPHASE1_NOT_DONE: u64 = 7;
    const EMTR_NOT_REQUESTED: u64 = 8;

    struct Registry has key {
        all_projects: vector<address>
    }

    struct PointStore has key {
        balances: Table<address, u64>
    }

    struct Project has key {
        founder: address,
        title: String,
        description: String,
        funding_goal: u64,
        current_funds: u64,
        released: u64,
        upvotes: vector<address>,
        is_validated: bool,
        active: bool,
        milestone_requested: bool
    }

    fun init_module(admin: &signer) {
        move_to(
            admin,
            Registry {
                all_projects: vector::empty<address>()
            }
        );
        move_to(
            admin,
            PointStore {
                balances: table::new<address, u64>()
            }
        );
    }

    fun add_points(user: address, amount: u64) {
        let store = borrow_global_mut<PointStore>(@riscend_addr);
        if (!table::contains(&store.balances, user)) {
            table::add(&mut store.balances, user, amount);
        } else {
            let current = table::borrow_mut(&mut store.balances, user);
            *current = *current + amount;
        };
    }

    public entry fun create_project(
        founder: &signer,
        goal: u64,
        title: String,
        description: String
    ) {
        let founder_addr = signer::address_of(founder);
        let new_project = Project {
            founder: founder_addr,
            title,
            description,
            funding_goal: goal,
            current_funds: 0,
            released: 0,
            upvotes: vector::empty<address>(),
            is_validated: false,
            active: true,
            milestone_requested: false
        };
        move_to(founder, new_project);
        let registry = borrow_global_mut<Registry>(@riscend_addr);
        vector::push_back(&mut registry.all_projects, founder_addr);
    }

    public entry fun upvote_project(voter: &signer, project_addr: address) {
        let project = borrow_global_mut<Project>(project_addr);
        let voter_addr = signer::address_of(voter);
        assert!(!vector::contains(&project.upvotes, &voter_addr), EALREADY_UPVOTED);
        vector::push_back(&mut project.upvotes, voter_addr);

        if (vector::length(&project.upvotes) >= VALIDATION_THRESHOLD) {
            project.is_validated = true;
        };
    }

    public entry fun contribute(
        backer: &signer, project_addr: address, amount: u64
    ) {
        let project = borrow_global_mut<Project>(project_addr);
        let backer_addr = signer::address_of(backer);
        assert!(project.active, EPROJECT_INACTIVE);
        assert!(project.is_validated, ENOT_VALIDATED);

        coin::transfer<AptosCoin>(backer, @riscend_addr, amount);
        project.current_funds = project.current_funds + amount;

        let points_earned = (amount * POINTS_PER_APT) / 100000000;
        add_points(backer_addr, points_earned);
    }

    public entry fun finalize_funding(
        admin: &signer, project_addr: address
    ) {
        let project = borrow_global_mut<Project>(project_addr);
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @riscend_addr, ENOT_AUTHORIZED);
        assert!(project.active, EPROJECT_INACTIVE);
        assert!(project.current_funds >= project.funding_goal, EGOAL_NOT_MET);

        let total = project.current_funds;
        let platform_fee = (total * PLATFORM_FEE_PERCENT) / 100;
        let amount_to_founder = total - platform_fee;
        let phase1_amount = amount_to_founder / 2;

        coin::transfer<AptosCoin>(admin, project.founder, phase1_amount);
        project.released = project.released + phase1_amount;
        project.active = false;
        add_points(project.founder, FOUNDER_FINALIZATION_BONUS);
    }

    public entry fun request_next_milestone(
        founder: &signer, project_addr: address
    ) {
        let project = borrow_global_mut<Project>(project_addr);
        assert!(signer::address_of(founder) == project.founder, ENOT_AUTHORIZED);
        assert!(!project.active, EPROJECT_INACTIVE);
        assert!(project.released > 0, EPHASE1_NOT_DONE);
        assert!(!project.milestone_requested, EALREADY_REQUESTED);
        project.milestone_requested = true;
    }

    public entry fun approve_milestone(
        admin: &signer, project_addr: address
    ) {
        let project = borrow_global_mut<Project>(project_addr);
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @riscend_addr, ENOT_AUTHORIZED);
        assert!(project.milestone_requested, EMTR_NOT_REQUESTED);

        let total = project.current_funds;
        let platform_fee = (total * PLATFORM_FEE_PERCENT) / 100;
        let amount_to_founder = total - platform_fee;
        let phase2_amount = amount_to_founder - project.released;

        coin::transfer<AptosCoin>(admin, project.founder, phase2_amount);
        project.released = project.released + phase2_amount;
        project.milestone_requested = false;
    }

    #[view]
    public fun get_all_projects(): vector<address> {
        borrow_global<Registry>(@riscend_addr).all_projects
    }

    #[view]
    public fun get_user_points(user_addr: address): u64 {
        let store = borrow_global<PointStore>(@riscend_addr);
        if (table::contains(&store.balances, user_addr)) {
            *table::borrow(&store.balances, user_addr)
        } else { 0 }
    }

    #[view]
    public fun get_project_details(
        project_addr: address
    ): (String, String, u64, u64, u64, bool, bool, bool, u64) {
        let project = borrow_global<Project>(project_addr);
        (
            project.title,
            project.description,
            project.funding_goal,
            project.current_funds,
            project.released,
            project.is_validated,
            project.active,
            project.milestone_requested,
            vector::length(&project.upvotes) // Returned as 9th value
        )
    }
}

