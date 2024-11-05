import Bool "mo:base/Bool";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";

actor {
    // Stable storage for high scores
    private stable var highScores : [(Text, Nat)] = [];
    private var highScoresMap = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);

    // Initialize map from stable storage
    private func loadHighScores() {
        for ((name, score) in highScores.vals()) {
            highScoresMap.put(name, score);
        };
    };

    system func preupgrade() {
        highScores := Iter.toArray(highScoresMap.entries());
    };

    system func postupgrade() {
        loadHighScores();
    };

    // Submit a new high score
    public shared func submitScore(name : Text, score : Nat) : async Bool {
        let currentScore = highScoresMap.get(name);
        switch (currentScore) {
            case (?existing) {
                if (score > existing) {
                    highScoresMap.put(name, score);
                    return true;
                };
                return false;
            };
            case null {
                highScoresMap.put(name, score);
                return true;
            };
        };
    };

    // Get all high scores
    public query func getHighScores() : async [(Text, Nat)] {
        let entries = Iter.toArray(highScoresMap.entries());
        Array.sort(entries, func(a : (Text, Nat), b : (Text, Nat)) : {#less; #equal; #greater} {
            if (a.1 > b.1) { #less }
            else if (a.1 < b.1) { #greater }
            else { #equal }
        })
    };
}
